package game

import (
	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/websocket"
	"net/http"
	"sync"
	"time"
)

type ConnToMapInterface interface {
	Sender
	Unregister(GameObject)
}

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = 3 * time.Second //(pongWait * 9) / 10
	maxMessageSize = 512
	rwBufferSize   = 1024
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  rwBufferSize,
	WriteBufferSize: rwBufferSize,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

type Connection struct {
	ws          *websocket.Conn
	sendMessage chan Message
	ping_pong   time.Time
	lag         time.Duration
	sync.Mutex
}

func (c *Connection) Lag() time.Duration {
	c.Lock()
	defer c.Unlock()
	return c.lag
}

func (c *Connection) readPump(game ConnToMapInterface, avatar GameObject) {
	defer func() {
		game.Unregister(avatar)
		c.ws.Close()
	}()

	c.ws.SetReadLimit(maxMessageSize)
	c.ws.SetReadDeadline(time.Now().Add(pongWait))
	c.ws.SetPongHandler(func(string) error {
		c.Lock()
		defer c.Unlock()
		c.ws.SetReadDeadline(time.Now().Add(pongWait))
		if c.ping_pong.IsZero() {
			c.ping_pong = time.Now()
		}
		c.lag = time.Now().Sub(c.ping_pong)
		return nil
	})

	for {
		op, message, err := c.ws.ReadMessage()
		if err != nil {
			break
		}

		switch op {
		case websocket.TextMessage:
			// pass
		case websocket.BinaryMessage:
			m, err := CurrentProtocol.DecodeMessage(message)
			if err == nil {
				game.Send(avatar.Id(), m)
			} else {
				log.Error(err)
			}
		}
	}
}

func (c *Connection) writeMessage(message interface{}) error {
	c.ws.SetWriteDeadline(time.Now().Add(writeWait))
	return c.ws.WriteJSON(message)
}
func (c *Connection) write(mt int, payload []byte) error {
	c.ws.SetWriteDeadline(time.Now().Add(writeWait))
	return c.ws.WriteMessage(mt, payload)
}
func (c *Connection) ping() error {
	c.Lock()
	defer c.Unlock()
	c.ping_pong = time.Now()
	return c.write(websocket.PingMessage, []byte{})
}

func (c *Connection) writePump() {
	ticker := time.NewTicker(pingPeriod)

	defer func() {
		ticker.Stop()
		c.ws.Close()
	}()

	if err := c.ping(); err != nil {
		log.Error("ping failure ", err)
		return
	}

	for {
		select {
		case message, ok := <-c.sendMessage:
			if !ok {
				c.write(websocket.CloseMessage, []byte{})
				return
			}

			b, err := CurrentProtocol.EncodeMessage(message)
			if err != nil {
				log.Error("wrap msg: ", err)
				return
			}
			err = c.write(websocket.BinaryMessage, b)
			if err != nil {
				return
			}
		case <-ticker.C:
			if err := c.ping(); err != nil {
				log.Warn("ping failure ", err)
				return
			}
		}
	}
}
