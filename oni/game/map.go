package game

// TODO use qtree

import (
	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/websocket"
	"math/rand"
	"oniproject/oni/geom"
	"oniproject/oni/jps"
	"oniproject/oni/utils"
	"path"
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

func avatarFilter(obj GameObject) bool {
	if _, ok := obj.(*Avatar); ok {
		return false
	}
	return true
}

type Map struct {
	tick                 uint
	objects              map[utils.Id]GameObject
	register, unregister chan GameObject
	sendTo               chan sender
	Grid                 *jps.Grid
	game                 *Game
}

func NewMap(game *Game) *Map {
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
		game:       game,
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
		d := center.DistanceFrom(obj.Position())
		if d <= r && !exclude(obj) {
			objects = append(objects, obj)
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
	monster.HP, monster.MHP, monster.HRG = 20, 20, 1
	m.register <- monster
	monster.RunAI()
}

func (m *Map) DropItem(x, y float64, item *Item) {
	ditem := NewDroppedItem(x, y, item)
	ditem.id = utils.NewId(-int64(rand.Intn(10000) - 20000))
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
	closeChan := func(avatar *Avatar) {
		defer func() {
			if err := recover(); err != nil {
				log.Error(err)
			}
		}()
		close(avatar.sendMessage)
	}

	rand.Seed(time.Now().UnixNano())

	go gm.SpawnMonster()
	go gm.SpawnMonster()
	go gm.SpawnMonster()
	go gm.SpawnMonster()

	test_knife, _ := LoadItemYaml(path.Join(ITEM_PATH, "knife.yml"))
	go gm.DropItem(3, 2, test_knife)

	t_replication := time.NewTicker(TickRate)
	t_regeneration := time.NewTicker(1 * time.Second)

	for {
		select {
		case <-t_regeneration.C:
			avatars := []*Avatar{}

			// update all Regeneration
			for _, obj := range gm.objects {
				obj.Regeneration()
				if avatar, ok := obj.(*Avatar); ok {
					send(avatar, WrapMessage(&ParametersMsg{
						Parameters: avatar.Parameters,
						Skills:     avatar.Skills,
					}))
					avatars = append(avatars, avatar)
				}
			}

			// target data
			for _, avatar := range avatars {
				gm.Send(avatar.Id(), &SetTargetMsg{avatar.Target})
			}

		// replication
		case <-t_replication.C:
			// send tick
			gm.tick++

			// update position
			updated := map[utils.Id]bool{}
			for id, obj := range gm.objects {
				if ok := obj.Update(gm, gm.tick, TickRate); ok {
					updated[id] = true
				}
			}

			// send states to obj
			for id, obj := range gm.objects {
				state := &GameObjectState{
					STATE_IDLE,
					obj.Id(), gm.tick,
					obj.Lag(), obj.Position(), obj.Velocity()}

				if updated[id] {
					state.Type = STATE_MOVE
				}

				pos := obj.Position()
				around := gm.ObjectsAround(pos.X, pos.Y, ReplicRange, avatarFilter)

				for _, a := range around {
					avatar := a.(*Avatar)
					send(avatar, gm.tick)
					send(avatar, state)
				}
			}

		// create/destroy GameObject's
		case obj := <-gm.register:
			if c, ok := obj.(*Avatar); ok {
				send(c, gm.tick)
			}
			gm.objects[obj.Id()] = obj
			log.Debug("register", obj.Id(), obj)
		case obj := <-gm.unregister:
			delete(gm.objects, obj.Id())
			if avatar, ok := obj.(*Avatar); ok {
				closeChan(avatar)
				gm.game.adb.SaveAvatar(avatar)
			}
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
