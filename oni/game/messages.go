package game

import (
	log "github.com/Sirupsen/logrus"
	"github.com/oniproject/geom"
	"math"
	"oniproject/oni/utils"
	"strings"
)

type Sender interface {
	Send(utils.Id, Message)
}

type MessageToMapInterface interface {
	// XXX
	GetObjById(utils.Id) GameObject
	Unregister(GameObject)

	SyncVelocity(GameObject)

	Dropper
}

// command
type Message interface {
	Run(GameObject)
}

func init() {
	m := []interface{}{
		0, // pass
		&SetVelocityMsg{},
		&SetTargetMsg{}, // XXX deprecate

		&CastMsg{},    // see skill_cast_msg.go
		&DestroyMsg{}, // XXX deprecate

		// see dropped_item_msg.go
		&DropItemMsg{},
		&PickupItemMsg{},
		&RequestInventoryMsg{},
		&InventoryMsg{},

		&TargetDataMsg{}, // XXX deprecate

		&RequestParametersMsg{},
		&ParametersMsg{},

		&ChatMsg{},
		&ChatPostMsg{},

		&ReplicaMsg{}, // see replic_msg.go
		//&AddMsg{},
		//&RemoveMsg{},
		//&UpdateMsg{},
	}
	for id, obj := range m {
		if id == 0 {
			continue
		}
		messages.Register(uint(id), obj)
	}
}

/*type SetPositionMsg struct {
	X float64 `mapstructure:"x"`
	Y float64 `mapstructure:"y"`
	//Z float64 `mapstructure:"z"`
}

func (m *SetPositionMsg) Run(obj GameObject) {
	coord := geom.Coord{X: m.X, Y: m.Y}
	obj.SetPosition(coord.X, coord.Y)
	// XXX
}*/

type SetVelocityMsg struct {
	X float64 `mapstructure:"x"`
	Y float64 `mapstructure:"y"`
	//Z float64 `mapstructure:"z"`
}

func (m *SetVelocityMsg) Run(obj GameObject) {
	defer obj.SyncVelocity(obj) // XXX

	coord := geom.Coord{X: m.X, Y: m.Y}

	if a, ok := obj.(*Avatar); ok {
		if a.state == STATE_CAST || a.state == STATE_DEAD {
			return
		}
		coord = coord.Unit().Times(4)
		nox := math.IsNaN(coord.X) || coord.X == 0
		noy := math.IsNaN(coord.Y) || coord.Y == 0
		if nox && noy {
			a.state = STATE_IDLE
		} else {
			a.state = STATE_MOVE
		}
	}

	if math.IsNaN(coord.X) {
		coord.X = 0
	}
	if math.IsNaN(coord.Y) {
		coord.Y = 0
	}

	obj.SetVelocity(coord.X, coord.Y)
}

type SetTargetMsg struct {
	Target utils.Id `mapstructure:"id"`
}

func (m *SetTargetMsg) Run(obj GameObject) {
	//panic("Run SetTargetMsg")
	/*
		a := obj.(*Avatar)
		a.Target = m.Target

		msg := &TargetDataMsg{Id: a.Target, Race: 0, HP: 0, MHP: 0, Name: ""}

		defer func() {
			msg.Id = a.Target
			a.sendMessage <- msg
		}()

		target := a.GetObjById(a.Target)
		if target == nil {
			a.Target = 0
			return
		}

		// XXX remove target if distance > ReplicRange
		if target.Position().DistanceFrom(a.Position()) > ReplicRange {
			a.Target = 0
			return
		}

		msg.HP, msg.MHP = target.HPbar()
		msg.Name = target.Name()
		//msg.Race = target.Race()
	*/
}

/*
type CloseMsg struct{}

func (m *CloseMsg) Run(obj GameObject) {
	log.Debug("UnregisterMsg ", obj)
	a := obj.(*Avatar)
	a.ws.Close()
}
*/

type DestroyMsg struct {
	Id utils.Id
	T  uint // tick
}

func (m *DestroyMsg) Run(obj GameObject) {
	if a, ok := obj.(*Avatar); ok {
		a.sendMessage <- m
	} else {
		log.Warningf("fail send: not a Avatar %T %v", obj, obj)
	}
}

type TargetDataMsg struct {
	Id      utils.Id
	Race    int
	HP, MHP int
	Name    string
}

func (m *TargetDataMsg) Run(obj GameObject) {
	log.Panic("TargetDataMsg Run")
}

type RequestParametersMsg struct{}

func (m *RequestParametersMsg) Run(obj GameObject) {
	a := obj.(*Avatar)
	log.Debugf("RequestParametersMsg %v %v", a.Parameters, a.Skills)
	a.sendMessage <- &ParametersMsg{Parameters: a.Parameters, Skills: a.Skills}
}

type ParametersMsg struct {
	Parameters Parameters
	Skills     map[string]*Skill
}

func (m *ParametersMsg) Run(obj GameObject) { log.Panic("ParametersMsg Run") }

type ChatMsg struct {
	Type string `mapstructure:"type"`
	Text string `mapstructure:"text"`
	Id   int64  `mapstructure:"id"`
	Name string `mapstructure:"name"`
}

func (m *ChatMsg) Run(obj GameObject) { log.Panic("ChatMsg Run") }

type ChatPostMsg struct {
	Msg string `mapstructure:"m"`
}

func (m *ChatPostMsg) Run(obj GameObject) {
	a := obj.(*Avatar)
	msg := m.Msg
	t := ""
	if msg[0] == '/' {
		arr := strings.SplitN(m.Msg, " ", 2)
		if len(arr) == 2 {
			t = arr[0][1:]
			msg = strings.TrimSpace(arr[1])
		}
	}
	post := &ChatMsg{Id: int64(a.Id()), Type: t, Text: msg, Name: a.Name()}
	log.Println(post)
	a.sendMessage <- post
}

//func (m *AddMsg) Run(MessageToMapInterface, interface{})     { log.Panic("run") }
//func (m *RemoveMsg) Run(MessageToMapInterface, interface{})  { log.Panic("run") }
//func (m *UpdateMsg) Run(MessageToMapInterface, interface{})  { log.Panic("run") }

// TODO TODO TODO
type DamageMsg struct {
	Tick uint
	Id   utils.Id
	Text string // why string? How about MISS or BLOCK?
}

func (m *DamageMsg) Run(GameObject) { log.Panic("run") }
