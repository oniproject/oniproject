package oni

import (
	"github.com/gorilla/websocket"
	"log"
	"oniproject/oni/jps"
	"time"
)

type GameObject interface {
	Update(tick uint, t time.Duration) *State
	GetState(typ uint8, tick uint) *State
	Position() Point
	Send(Message)
	Id() Id
}

type Map struct {
	tick                 uint
	objects              map[Id]GameObject
	register, unregister chan GameObject
	broadcast            chan interface{}
	sendTo               chan sender
	Grid                 *jps.Grid
}

type sender struct {
	id Id
	m  Message
}

func NewMap() *Map {
	// TODO remove it
	s := `XXXXXX
X....X
X....X
X..X.X
X....X
XXXXXX`
	return &Map{
		register:   make(chan GameObject),
		unregister: make(chan GameObject),
		objects:    make(map[Id]GameObject),
		broadcast:  make(chan interface{}),
		sendTo:     make(chan sender),
		Grid:       jps.FromString(s, 8, 6),
	}
}

func (m *Map) Walkable(x, y int) bool {
	return m.Grid.Walkable(x, y)
}
func (m *Map) Unregister(a *Avatar) {
	go func() { m.unregister <- a }()
}
func (gm *Map) Send(id Id, m Message) {
	go func() { gm.sendTo <- sender{id, m} }()
	log.Println("Send: ", id, m)
}

func (m *Map) RunAvatar(ws *websocket.Conn, data AvatarData) {
	conn := AvatarConnection{
		ws:          ws,
		sendMessage: make(chan interface{}, 256),
		ping_pong:   time.Now(),
	}
	c := &Avatar{data, conn, 0, m, Point{}}

	m.register <- c
	go c.writePump()
	c.readPump()
}

func (gm *Map) replication() {
	var states []interface{}
	for _, obj := range gm.objects {
		state := obj.Update(gm.tick, TickRate)
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
			delete(gm.objects, c.Id())
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
		case obj := <-gm.register:
			if c, ok := obj.(*Avatar); ok {
				send(c, gm.tick)
				for _, ava := range gm.objects {
					send(c, ava.GetState(STATE_CREATE, gm.tick))
				}
			}
			gm.objects[obj.Id()] = obj
			go func() { gm.broadcast <- obj.GetState(STATE_CREATE, gm.tick) }()
			log.Println("register", obj)
		case obj := <-gm.unregister:
			delete(gm.objects, obj.Id())
			if c, ok := obj.(*Avatar); ok {
				close(c.sendMessage)
			}
			go func() { gm.broadcast <- obj.GetState(STATE_DESTROY, gm.tick) }()
			log.Println("unregister", obj)
		case s := <-gm.sendTo:
			if obj, ok := gm.objects[s.id]; ok {
				obj.Send(s.m)
			} else {
				log.Printf("fail sendTo: broken ID %v %T", s, s.m)
			}
		case m := <-gm.broadcast:
			for _, c := range gm.objects {
				if ava, ok := c.(*Avatar); ok {
					send(ava, m)
				}
			}
		}
	}
}
