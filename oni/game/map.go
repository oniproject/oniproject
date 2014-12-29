package game

// TODO use qtree

import (
	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/websocket"
	"github.com/oniproject/geom"
	"github.com/oniproject/tmxconverter/tmx"
	"oniproject/oni/jps"
	"oniproject/oni/utils"
	"path"
	"runtime/debug"
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
	tmxMap               tmx.Map

	*Replicator
}

func NewMap(game *Game, name string) *Map {
	fname := path.Join("data/maps/", name+".tmx")
	tmxMap, err := tmx.LoadTMX(fname)
	if err != nil {
		log.Panic("fail load map: ", fname, err)
	}
	layer := tmxMap.LayerByName("COLLISION", "tilelayer")
	if layer == nil {
		log.Panic("layer COLLISION notfound: ", fname)
	}

	data, err := layer.Data.Data()
	if err != nil {
		log.Panicf("fail load data from COLLISION layer: ", fname, err)
	}

	grid := jps.NewGrid(tmxMap.Width, tmxMap.Height)
	for k, v := range data {
		x, y := k%tmxMap.Width, k/tmxMap.Width
		grid.SetWalkable(x, y, v <= 0)
	}

	return &Map{
		register:    make(chan GameObject),
		unregister:  make(chan GameObject),
		objects:     make(map[utils.Id]GameObject),
		sendTo:      make(chan sender),
		Grid:        grid,
		game:        game,
		lastLocalId: -4,
		tmxMap:      tmxMap,
		Replicator:  NewReplicator(ReplicRange, float64(tmxMap.Width), float64(tmxMap.Height)),
	}
}

func (m *Map) Walkable(c geom.Coord) bool {
	return m.Grid.Walkable(int(c.X), int(c.Y))
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

func (m *Map) RunAvatar(ws *websocket.Conn, c *Avatar) {
	c.PositionComponent = NewPositionComponent(c.X, c.Y)
	m.register <- c
	go c.writePump()
	c.readPump(m, c)
}

func (m *Map) SpawnMonster(x, y float64) {
	monster := NewMonster()
	monster.SetPosition(x, y)
	monster.MonsterType = "Bat"
	m.lastLocalId--
	monster.id = utils.NewId(m.lastLocalId)
	monster.HP, monster.MHP, monster.HRG = 20, 20, 1
	m.register <- monster
	monster.RunAI()
}

func (m *Map) DropItem(x, y float64, item string) {
	ditem := NewDroppedItem(x, y, item)

	m.lastLocalId--
	ditem.id = utils.NewId(m.lastLocalId - 20000)
	m.Register(ditem)
}

func (gm *Map) Run() {
	send := func(c *Avatar, m Message) {
		select {
		case c.sendMessage <- m:
		default:
			go func() { gm.unregister <- c }()
		}
	}
	closeChan := func(avatar *Avatar) {
		defer func() {
			if err := recover(); err != nil {
				log.Error(err, "\n", string(debug.Stack()))
			}
		}()
		close(avatar.sendMessage)
	}

	//noFilter := func(GameObject) bool { return false }

	x, y := 20, 15
	for i := 0; i < 4; i++ {
		go gm.SpawnMonster(float64(x+0), float64(y+i))
		go gm.SpawnMonster(float64(x+1), float64(y+i))
		go gm.SpawnMonster(float64(x+2), float64(y+i))
		go gm.SpawnMonster(float64(x+3), float64(y+i))
		go gm.SpawnMonster(float64(x+4), float64(y+i))
		go gm.SpawnMonster(float64(x+5), float64(y+i))

		go gm.DropItem(float64(x+6), float64(y+i), "knife")
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
					send(avatar, &ParametersMsg{
						Parameters: avatar.Parameters,
						Skills:     avatar.Skills,
					})
					avatars = append(avatars, avatar)
				}
			}

			// target data
			for _, avatar := range avatars {
				gm.Send(avatar.Id(), &SetTargetMsg{avatar.Target})
			}

		// replication
		case <-t_replication.C:
			gm.tick++

			// update position
			var updated []GameObject
			for _, obj := range gm.objects {
				if ok := obj.Update(gm, gm.tick, TickRate); ok {
					updated = append(updated, obj)
					gm.tree.Remove(obj)
					gm.tree.Insert(obj)
				}
			}

			// XXX teleports
			for _, obj := range updated {
				if a, ok := obj.(*Avatar); ok {
					pos := a.Position()
					layer := gm.tmxMap.LayerByName("TELEPORTS", "objectgroup")
					objects := layer.ObjectsByPoint(pos.X*32, pos.Y*32)
					for _, o := range objects {
						log.Warn("!!!!!! found: ", o.Name)
						switch o.Name {
						case "test":
							a.MapId = "test"
							a.SetPosition(pos.X, 39)
							gm.Unregister(a)
						case "test2":
							a.MapId = "test2"
							a.SetPosition(pos.X, 2)
							gm.Unregister(a)
						}
					}
				}
			}

			for _, obj := range updated {
				gm.Replicator.Update(obj)
			}
			gm.Replicator.Process()

		// create/destroy GameObject's
		case obj := <-gm.register:
			gm.objects[obj.Id()] = obj
			gm.Replicator.Add(obj)
			log.Info("register", obj.Id(), obj.Position())
		case obj := <-gm.unregister:
			delete(gm.objects, obj.Id())
			if avatar, ok := obj.(*Avatar); ok {
				closeChan(avatar)
				gm.game.adb.SaveAvatar(avatar)
			}
			gm.Replicator.Remove(obj)
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
