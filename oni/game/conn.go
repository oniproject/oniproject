package game

import (
	"bytes"
	"code.google.com/p/cbor/go"
	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/websocket"
	"net/http"
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
}

func (c *Connection) Lag() time.Duration { return c.lag }

func (c *Connection) readPump(game ConnToMapInterface, avatar GameObject) {
	defer func() {
		game.Unregister(avatar)
		c.ws.Close()
	}()

	c.ws.SetReadLimit(maxMessageSize)
	c.ws.SetReadDeadline(time.Now().Add(pongWait))
	c.ws.SetPongHandler(func(string) error {
		c.ws.SetReadDeadline(time.Now().Add(pongWait))
		c.lag = time.Now().Sub(c.ping_pong)
		return nil
	})

Loop:
	for {
		op, message, err := c.ws.ReadMessage()
		if err != nil {
			break
		}
		// TODO parse move message

		switch op {
		case websocket.TextMessage:
		case websocket.BinaryMessage:
			var val struct {
				T uint8
				V map[string]interface{}
			}

			buf := bytes.NewBuffer(message)
			if err := cbor.NewDecoder(buf).Decode(&val); err != nil {
				log.Error(err)
				continue Loop
			}
			if m, err := ParseMessage(val.T, val.V); err == nil {
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

			buf := bytes.NewBuffer([]byte{})
			encoder := cbor.NewEncoder(buf)
			if err := encoder.Encode(WrapMessage(message)); err != nil {
				log.Error("cbor encode: ", err)
				return
			}

			if err := c.write(websocket.BinaryMessage, buf.Bytes()); err != nil {
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
