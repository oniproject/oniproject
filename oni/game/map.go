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
	//"sync"
	"time"
)

const (
	TickRate     = 60 * time.Millisecond
	SpeedOfLight = 2
	ReplicRange  = 20
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
	tick                         uint
	objects                      map[utils.Id]GameObject
	register, unregister, update chan GameObject
	sendTo                       chan sender
	Grid                         *jps.Grid
	game                         *Game
	lastLocalId                  int64
	tmxMap                       tmx.Map

	updated GameObjectSet

	*Replicator
	*Physics
	*AI

	localIdPool utils.IdPool
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

	m := &Map{
		register:    make(chan GameObject),
		unregister:  make(chan GameObject),
		update:      make(chan GameObject),
		objects:     make(map[utils.Id]GameObject),
		updated:     NewGameObjectSet(),
		sendTo:      make(chan sender),
		game:        game,
		lastLocalId: -4,
		tmxMap:      tmxMap,
		Replicator:  NewReplicator(ReplicRange, float64(tmxMap.Width), float64(tmxMap.Height)),
		AI:          NewAI(),
	}

	m.Physics = NewPhysic(m, float64(tmxMap.Width), float64(tmxMap.Height))
	m.Grid = jps.NewGrid(tmxMap.Width, tmxMap.Height)

	for k, v := range data {
		x, y := k%tmxMap.Width, k/tmxMap.Width
		m.Grid.SetWalkable(x, y, v <= 0)
		if v > 0 {
			m.Physics.AddStaticBox(float64(x), float64(y), 1.0, 1.0)
		}
	}

	return m
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
func (m *Map) Update(a GameObject) {
	go func() { m.update <- a }()
}

func (gm *Map) Send(id utils.Id, m Message) {
	go func() { gm.sendTo <- sender{id, m} }()
}

func (m *Map) GetObjById(id utils.Id) (obj GameObject) {
	return m.objects[id]
}

func (m *Map) RunAvatar(ws *websocket.Conn, c *Avatar) {
	c.Map = m
	m.register <- c
	go c.writePump()
	c.readPump(m, c)
}

func (m *Map) SpawnMonster(x, y float64) {
	monster := NewMonster(m)
	monster.SetPosition(x, y)
	monster.MonsterType = "Bat"
	monster.id = -m.localIdPool.Get()
	monster.HP, monster.MHP, monster.HRG = 20, 20, 1
	m.Register(monster)
	//monster.RunAI()
}

func (m *Map) DropItem(x, y float64, item string) {
	ditem := NewDroppedItem(x, y, item, m)
	ditem.id = -m.localIdPool.Get()
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

	killAI := make(chan struct{})
	go gm.AI.Run(killAI)

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

		// replication
		case <-t_replication.C:
			gm.tick++

			// update position
			var updated []GameObject
			/*for _, obj := range gm.objects {
				if ok := obj.Update(gm, gm.tick, TickRate); ok {
					updated = append(updated, obj)
					gm.tree.Remove(obj)
					gm.tree.Insert(obj)
				}
			}*/

			updated = gm.Physics.Process()
			for _, obj := range updated {
				gm.tree.Remove(obj)
				gm.tree.Insert(obj)
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
		case obj := <-gm.update:
			gm.updated.Add(obj)

		case obj := <-gm.register:
			gm.objects[obj.Id()] = obj
			gm.Replicator.Add(obj)
			gm.Physics.Add(obj)
			gm.AI.Add(obj)
			log.Debug("register", obj.Id(), obj.Position(), obj)
		case obj := <-gm.unregister:
			delete(gm.objects, obj.Id())
			if avatar, ok := obj.(*Avatar); ok {
				closeChan(avatar)
				gm.game.adb.SaveAvatar(avatar)
			} else {
				gm.localIdPool.Put(obj.Id())
			}
			gm.Replicator.Remove(obj)
			gm.Physics.Remove(obj)
			gm.AI.Remove(obj)
			log.Debug("unregister", obj.Id(), obj.Position(), obj)

		// message system
		case s := <-gm.sendTo:
			if obj, ok := gm.objects[s.id]; ok {
				s.m.Run(obj)
			} else {
				log.Warningf("fail sendTo: broken ID %v %T", s, s.m)
			}
		}
	}

	close(killAI)
}
