package game

// TODO use qtree

import (
	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/websocket"
	"math/rand"
	"oniproject/oni/geom"
	"oniproject/oni/jps"
	"oniproject/oni/utils"
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

type AroundController interface {
	ObjectsAround(x, y, r float64, exclude func(GameObject) bool) []GameObject
}

type Map struct {
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
func (m *Map) Register(a GameObject) {
	go func() { m.register <- a }()
}
func (m *Map) Unregister(a GameObject) {
	go func() { m.unregister <- a }()
}
func (gm *Map) Send(id utils.Id, m Message) {
	go func() { gm.sendTo <- sender{id, m} }()
}

func (gm *Map) GetObjById(id utils.Id) (obj GameObject) {
	return gm.objects[id]
}

func (gm *Map) ObjectsAround(x, y, r float64, exclude func(GameObject) bool) []GameObject {
	objects := []GameObject{}
	center := geom.Coord{X: x, Y: y}
	for _, obj := range gm.objects {
		if r <= obj.Position().DistanceFrom(center) {
			if !exclude(obj) {
				objects = append(objects, obj)
			}
		}
	}
	return objects
}

func (m *Map) RunAvatar(ws *websocket.Conn, c *Avatar) {
	c.PositionComponent = NewPositionComponent(c.X, c.Y)
	m.register <- c
	go c.writePump()
	c.readPump(m, c)
}

func (m *Map) SpawnMonster() {
	monster := NewMonster()
	monster.SetPosition(2, 3)
	monster.id = utils.NewId(-int64(rand.Intn(10000)))
	monster.HP, monster.MHP = 20, 20
	m.register <- monster
	monster.RunAI()
}

func (m *Map) DropItem(x, y float64, item *Item) {
	ditem := NewDroppedItem(x, y, item)
	ditem.id = utils.NewId(-int64(rand.Intn(10000) - 10000))
	m.Register(ditem)
}

func (m *Map) PickupItem(id utils.Id) *Item {
	obj, ok := m.objects[id]
	if !ok {
		return nil
	}
	if item, ok := obj.(*DroppedItem); ok {
		m.Unregister(obj)
		return item.Item
	} else {
		log.Error("try PickupItem: item is NOT item")
		return nil
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
		for id := range gm.objects {
			gm.Send(id, m)
		}
	}

	rand.Seed(time.Now().UnixNano())

	go gm.SpawnMonster()
	go gm.SpawnMonster()
	go gm.SpawnMonster()
	go gm.SpawnMonster()

	t_replication := time.NewTicker(TickRate)
	t_regeneration := time.NewTicker(1 * time.Second)

	for {
		select {
		// replication
		case <-t_regeneration.C:
			for _, obj := range gm.objects {
				obj.Regeneration()
			}

		case <-t_replication.C:
			// send tick
			gm.tick++
			broadcast(gm.tick)

			for _, obj := range gm.objects {
				updated := obj.Update(gm, gm.tick, TickRate)
				state := &GameObjectState{
					STATE_IDLE,
					obj.Id(), gm.tick,
					obj.Lag(), obj.Position(), obj.Velocity()}
				if updated {
					state.Type = STATE_MOVE
				}
				for _, c := range gm.objects {
					if avatar, ok := c.(*Avatar); ok {
						r := state.Position.DistanceFrom(avatar.Position())
						switch {
						case r < ReplicRange:
							send(avatar, state)
						// XXX for not send double messages
						case r < ReplicRange+float64(SpeedOfLight*0.05):
							gm.Send(avatar.Id(), &DestroyMsg{state.Id, gm.tick})
						}
					}
				}
			}

		// create/destroy GameObject's
		case obj := <-gm.register:
			if c, ok := obj.(*Avatar); ok {
				send(c, gm.tick)
				for _, ava := range gm.objects {
					send(c, &GameObjectState{
						STATE_CREATE,
						ava.Id(), gm.tick,
						ava.Lag(), ava.Position(), ava.Velocity()})
				}
			}
			gm.objects[obj.Id()] = obj
			broadcast(&GameObjectState{
				STATE_IDLE,
				obj.Id(), gm.tick,
				obj.Lag(), obj.Position(), obj.Velocity()})
			log.Debug("register", obj.Id(), obj)
		case obj := <-gm.unregister:
			delete(gm.objects, obj.Id())
			if c, ok := obj.(*Avatar); ok {
				close(c.sendMessage)
			}
			broadcastMsg(&DestroyMsg{obj.Id(), gm.tick})
			log.Debug("unregister", obj)

		// message system
		case s := <-gm.sendTo:
			if obj, ok := gm.objects[s.id]; ok {
				s.m.Run(gm, obj)
			} else {
				log.Warningf("fail sendTo: broken ID %v %T", s, s.m)
			}
		}
	}
}
