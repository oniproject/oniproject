package oni

import (
	"github.com/gorilla/websocket"
	"log"
	"time"
)

type Map struct {
	tick                 uint
	avatars              map[*Avatar]bool
	register, unregister chan *Avatar
	broadcast            chan interface{}
	Grid                 Grid
}

func (m *Map) RunAvatar(ws *websocket.Conn, data AvatarData) {
	conn := AvatarConnection{
		ws:          ws,
		sendMessage: make(chan interface{}, 256),
		ping_pong:   time.Now(),
	}
	c := &Avatar{data, conn, m}

	m.register <- c
	go c.writePump()
	c.readPump()
}

func (gm *Map) replication() {
	var states []interface{}
	for avatar := range gm.avatars {
		if avatar == nil {
			continue
		}

		state := avatar.Update(gm.tick, TickRate)
		if state == nil {
			continue
		}

		states = append(states, state)
	}
	gm.broadcast <- states
}

func (gm *Map) Run() {
	send := func(c *Avatar, m interface{}) {
		select {
		case c.sendMessage <- m:
		default:
			delete(gm.avatars, c)
			close(c.sendMessage)
		}
	}

	go func() {
		t := time.NewTicker(TickRate)
		for {
			select {
			case <-t.C:
				gm.tick++
				gm.broadcast <- gm.tick

				gm.replication()
			}
		}
	}()

	for {
		select {
		case c := <-gm.register:
			send(c, gm.tick)
			for ava := range gm.avatars {
				send(c, ava.GetState(STATE_CREATE, gm.tick))
			}
			gm.avatars[c] = false
			go func() { gm.broadcast <- c.GetState(STATE_CREATE, gm.tick) }()
			log.Println("register", c)
		case c := <-gm.unregister:
			delete(gm.avatars, c)
			close(c.sendMessage)
			go func() { gm.broadcast <- c.GetState(STATE_DESTROY, gm.tick) }()
			log.Println("unregister", c)
		case m := <-gm.broadcast:
			for c := range gm.avatars {
				send(c, m)
			}
		}
	}
}
