package game

// TODO use qtree

import (
	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/websocket"
	"github.com/oniproject/geom"
	"io/ioutil"
	"oniproject/oni/jps"
	"oniproject/oni/utils"
	"path"
	"strings"
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
	lastLocalId          int64
}

func NewMap(game *Game, name string) *Map {
	// TODO remove it
	b, err := ioutil.ReadFile("data/maps/" + name + ".wlk.txt")
	if err != nil {
		panic(err)
	}
	s := string(b)
	lines := strings.Split(s, "\n")
	w, h := len(lines[0]), len(lines)
	log.Printf("%d:%d\n%s\n", w, h, s)
	grid := jps.FromString(s, w, h)
	for y := 0; y < h; y++ {
		s := []byte{}
		for x := 0; x < w; x++ {
			if grid.Walkable(x, y) {
				s = append(s, ' ')
			} else {
				s = append(s, 'X')
			}
		}
	}
	/* w, h:= 8,6
		s := `XXXXXX
	X....X
	X....X
	X..X.X
	X....X
	XXXXXX`*/
	return &Map{
		register:    make(chan GameObject),
		unregister:  make(chan GameObject),
		objects:     make(map[utils.Id]GameObject),
		sendTo:      make(chan sender),
		Grid:        grid,
		game:        game,
		lastLocalId: -4,
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

func (m *Map) SpawnMonster(x, y float64) {
	monster := NewMonster()
	monster.SetPosition(x, y)
	m.lastLocalId--
	monster.id = utils.NewId(m.lastLocalId)
	monster.HP, monster.MHP, monster.HRG = 20, 20, 1
	m.register <- monster
	monster.RunAI()
}

func (m *Map) DropItem(x, y float64, item *Item) {
	ditem := NewDroppedItem(x, y, item)

	m.lastLocalId--
	ditem.id = utils.NewId(m.lastLocalId - 20000)
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

	test_knife, _ := LoadItemYaml(path.Join(ITEM_PATH, "knife.yml"))
	x, y := 5, 35

	for i := 0; i < 4; i++ {
		go gm.SpawnMonster(float64(x+0), float64(y+i))
		go gm.SpawnMonster(float64(x+1), float64(y+i))
		go gm.SpawnMonster(float64(x+2), float64(y+i))
		go gm.SpawnMonster(float64(x+3), float64(y+i))
		go gm.SpawnMonster(float64(x+4), float64(y+i))
		go gm.SpawnMonster(float64(x+5), float64(y+i))

		go gm.DropItem(float64(x+15), float64(y+i), test_knife)
	}

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
