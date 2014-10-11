package game

import (
	"github.com/gorilla/websocket"
	"log"
	"math/rand"
	"oniproject/oni/jps"
	"oniproject/oni/utils"
	"sync"
	"time"
)

const (
	TickRate     = 50 * time.Millisecond
	SpeedOfLight = 2
	ReplicRange  = 4
)

// for message system
type sender struct {
	id utils.Id
	m  Message
}

type Map struct {
	mtx sync.Mutex

	tick                 uint
	objects              map[utils.Id]GameObject
	register, unregister chan GameObject
	sendTo               chan sender
	Grid                 *jps.Grid
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
		objects:    make(map[utils.Id]GameObject),
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
func (gm *Map) Send(id utils.Id, m Message) {
	go func() { gm.sendTo <- sender{id, m} }()
	log.Println("Send: ", id, m)
}

func (gm *Map) GetObjById(id utils.Id) (obj GameObject) {
	gm.mtx.Lock()
	obj = gm.objects[id]
	gm.mtx.Unlock()
	return
}

func (m *Map) RunAvatar(ws *websocket.Conn, data Actor) {
	conn := AvatarConnection{
		ws:          ws,
		sendMessage: make(chan interface{}, 256),
		ping_pong:   time.Now(),
	}
	c := &Avatar{
		PositionComponent: NewPositionComponent(data.X, data.Y),
		AvatarConnection:  conn,
		Target:            0,
		data:              data,
		game:              m,
	}

	m.register <- c
	go c.writePump()
	c.readPump()
}

func (m *Map) SpawnMonster() {
	m.register <- &Monster{
		game:              m,
		PositionComponent: NewPositionComponent(2, 2),
		id:                utils.NewId(int64(rand.Intn(10000))),
	}
}

func (gm *Map) Run() {
	send := func(c *Avatar, m interface{}) {
		select {
		case c.sendMessage <- m:
		default:
			go func() { gm.unregister <- c }()
		}
	}

	broadcast := func(m interface{}) {
		for _, c := range gm.objects {
			if ava, ok := c.(*Avatar); ok {
				send(ava, m)
			}
		}
	}
	broadcastMsg := func(m Message) {
		for _, c := range gm.objects {
			c.Send(m)
		}
	}

	t := time.NewTicker(TickRate)

	rand.Seed(time.Now().UnixNano())

	go gm.SpawnMonster()
	go gm.SpawnMonster()
	go gm.SpawnMonster()
	go gm.SpawnMonster()

	for {
		gm.mtx.Lock()
		select {
		// replication
		case <-t.C:
			// send tick
			gm.tick++
			broadcast(gm.tick)

			for _, obj := range gm.objects {
				if state := obj.Update(gm.tick, TickRate); state != nil {
					for _, c := range gm.objects {
						if avatar, ok := c.(*Avatar); ok {
							r := state.Position.DistanceFrom(avatar.Position())
							switch {
							case r < ReplicRange:
								send(avatar, state)
							// XXX for not send double messages
							case r < ReplicRange+float64(SpeedOfLight*0.05):
								avatar.Send(&DestroyMsg{state.Id, gm.tick})
							}
						}
					}
				}
			}

		// create/destroy GameObject's
		case obj := <-gm.register:
			if c, ok := obj.(*Avatar); ok {
				send(c, gm.tick)
				for _, ava := range gm.objects {
					send(c, ava.GetState(STATE_CREATE, gm.tick))
				}
			}
			gm.objects[obj.Id()] = obj
			broadcast(obj.GetState(STATE_IDLE, gm.tick))
			log.Println("register", obj.Id(), obj)
		case obj := <-gm.unregister:
			delete(gm.objects, obj.Id())
			if c, ok := obj.(*Avatar); ok {
				close(c.sendMessage)
			}
			broadcastMsg(&DestroyMsg{obj.Id(), gm.tick})
			log.Println("unregister", obj)

		// message system
		case s := <-gm.sendTo:
			if obj, ok := gm.objects[s.id]; ok {
				obj.Send(s.m)
			} else {
				log.Printf("fail sendTo: broken ID %v %T", s, s.m)
			}
		}
		gm.mtx.Unlock()
	}
}
