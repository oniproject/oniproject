package oni

import (
	"bytes"
	"code.google.com/p/cbor/go"
	"github.com/gorilla/websocket"
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
		c.game.unregister <- c
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
			buf := bytes.NewBuffer(message)
			decoder := cbor.NewDecoder(buf)
			var vel []interface{}
			if err := decoder.Decode(&vel); err != nil {
				// TODO add time limit
				//c.game.broadcast <- string(message)
				continue Loop
			}
			for i := range c.Veloctity {
				switch vl := vel[i].(type) {
				case float64:
					c.Veloctity[i] = float64(vl)
				case int64:
					c.Veloctity[i] = float64(vl)
				case uint64:
					c.Veloctity[i] = float64(vl)
				case uint:
					c.Veloctity[i] = float64(vl)
				}
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
