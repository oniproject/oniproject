package game

import (
	"bytes"
	"code.google.com/p/cbor/go"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"time"
)

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

type AvatarConnection struct {
	ws          *websocket.Conn
	sendMessage chan interface{}
	ping_pong   time.Time
	Lag         time.Duration
}

func (c *Avatar) readPump() {
	defer func() {
		c.game.Unregister(c)
		c.ws.Close()
	}()

	c.ws.SetReadLimit(maxMessageSize)
	c.ws.SetReadDeadline(time.Now().Add(pongWait))
	c.ws.SetPongHandler(func(string) error {
		c.ws.SetReadDeadline(time.Now().Add(pongWait))
		c.Lag = time.Now().Sub(c.ping_pong)
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
				log.Println(err)
				continue Loop
			}
			if m, err := ParseMessage(val.T, val.V); err == nil {
				c.Send(m)
			} else {
				log.Println(err)
			}
		}
	}
}

func (c *Avatar) writeMessage(message interface{}) error {
	c.ws.SetWriteDeadline(time.Now().Add(writeWait))
	return c.ws.WriteJSON(message)
}
func (c *Avatar) write(mt int, payload []byte) error {
	c.ws.SetWriteDeadline(time.Now().Add(writeWait))
	return c.ws.WriteMessage(mt, payload)
}
func (c *Avatar) ping() error {
	c.ping_pong = time.Now()
	return c.write(websocket.PingMessage, []byte{})
}

func (c *Avatar) writePump() {
	ticker := time.NewTicker(pingPeriod)

	defer func() {
		ticker.Stop()
		c.ws.Close()
	}()

	if err := c.ping(); err != nil {
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
			encoder.Write(message)

			if err := c.write(websocket.BinaryMessage, buf.Bytes()); err != nil {
				return
			}
		case <-ticker.C:
			if err := c.ping(); err != nil {
				return
			}
		}
	}
}
