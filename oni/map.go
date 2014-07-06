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
}

func (m *Map) RunAvatar(ws *websocket.Conn, data AvatarData) {
	// TODO load data
	conn := AvatarConnection{
		game:        m,
		ws:          ws,
		sendMessage: make(chan interface{}, 256),
		ping_pong:   time.Now(),
	}
	c := &Avatar{data, conn}

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

	// TODO: init RPC

	/*end := make(chan bool)
	// run http server
	go func() {
		http.Handle("/", gm)
		err := http.ListenAndServe(gm.Addr, nil)
		if err != nil {
			log.Fatal("ListenAndServe: ", err)
		}
		end <- true
	}()*/

	for {
		select {
		case c := <-gm.register:
			gm.avatars[c] = false
			send(c, gm.tick)
			send(c, c.GetState(STATE_CREATE, gm.tick))
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
