package game

import (
	log "github.com/Sirupsen/logrus"
	"github.com/oniproject/geom"
	"math"
	. "oniproject/oni/game/inv"
	"oniproject/oni/utils"
	"strings"
	"time"
)

type Sender interface {
	Send(utils.Id, Message)
}

type MessageToMapInterface interface {
	// XXX
	GetObjById(utils.Id) GameObject
	Unregister(GameObject)

	SyncVelocity(GameObject)

	Sender
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
		&SetTargetMsg{},

		&CastMsg{},
		&DestroyMsg{}, // XXX deprecate

		&DropItemMsg{},
		&PickupItemMsg{},

		&RequestInventoryMsg{},
		&InventoryMsg{},

		&TargetDataMsg{}, // XXX deprecate

		&RequestParametersMsg{},
		&ParametersMsg{},

		&ChatMsg{},
		&ChatPostMsg{},

		&ReplicaMsg{},
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
}

type CastMsg struct {
	Type string `mapstructure:"t"`
}

func (m *CastMsg) Run(obj GameObject) {
	caster := obj.(*Avatar)

	skill, ok := caster.Skills[m.Type]
	if !ok {
		log.Errorf("cast Fail: Skill %s not learning ", m.Type)
		return
	}

	if skill.HPused > caster.HP || skill.MPused > caster.MP || skill.TPused > caster.TP {
		log.Error("cast FAIL: needed moar HP|MP|TP ", m)
		return
	}

	target := caster.GetObjById(caster.Target)

	if caster.Target == 0 {
		if skill.Target&TARGET_SELF != 0 {
			target = caster
		}
		log.Error("cast FAIL: zero target ", m)
		return
	}

	if target == nil {
		log.Error("cast FAIL: target notfound ", m)
		return
	}

	check := false

	switch target := target.(type) {
	case *Monster:
		check = skill.Target&TARGET_MONSTER != 0
	case *Avatar:
		equals := caster == target
		race := caster.Race() == target.Race()

		self := equals && skill.Target&TARGET_SELF != 0
		same := !equals && race && skill.Target&TARGET_SAME_RACE != 0
		another := !equals && !race && skill.Target&TARGET_ANOTHER_RACE != 0

		check = self || same || another
	default:
		log.Warn("Fail Target typeSwithc")
		return
	}

	if !check {
		log.Warn("Fail Target")
		return
	}

	if err := caster.Cast(m.Type, target); err != nil {
		log.Error("cast ", err)
		return
	}

	caster.RecoverHP(float64(-skill.HPused))
	caster.RecoverMP(float64(-skill.MPused))
	caster.RecoverTP(float64(-skill.TPused))

	if hp, _ := target.HPbar(); hp == 0 {
		switch target := target.(type) {
		case *Avatar:
			target.HRG = 0 // FIXME
			target.state = STATE_DEAD
		case *Monster:
			target.HRG = 0 // FIXME
			caster.Unregister(target)
		}
	}

	caster.sendMessage <- &ParametersMsg{Parameters: caster.Parameters, Skills: caster.Skills}
	caster.Map.Replicator.Update(target)

	log.Infof("cast OK: %v %d", m, caster.Target)
}

type CloseMsg struct{}

func (m *CloseMsg) Run(obj GameObject) {
	log.Debug("UnregisterMsg ", obj)
	a := obj.(*Avatar)
	a.ws.Close()
}

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

type DropItemMsg struct {
	Id int
}

func (m *DropItemMsg) Run(obj GameObject) {
	defer func() {
		if err := recover(); err != nil {
			log.Error("fail DropItemMsg: item notfound")
		}
	}()
	a := obj.(*Avatar)

	x := m.Id % a.InventoryComponent.Width()
	y := m.Id / a.InventoryComponent.Width()

	name, err := a.GetItem(x, y)
	if err != nil {
		return
	}

	a.RemoveItem(x, y)

	pos := a.Position()
	obj.DropItem(pos.X, pos.Y, name)

	SendInventory(a)
}

type PickupItemMsg struct {
	Target utils.Id `mapstructure:"t"`
}

func (m *PickupItemMsg) Run(obj GameObject) {
	a := obj.(*Avatar)
	if obj := obj.GetObjById(a.Target); obj != nil {
		if item, ok := obj.(*DroppedItem); ok {
			err := a.AddItem(item.Item, 0, 0)
			if err == nil {
				obj.Unregister(obj)

				SendInventory(a)
				return
			}
		}
	}

	log.Error("FAIL PickupItem")
	return
}

type RequestInventoryMsg struct{}

func (m *RequestInventoryMsg) Run(obj GameObject) {
	a := obj.(*Avatar)
	log.Debugf("RequestInventoryMsg %v %v", a.Inventory, a.Equip)
	SendInventory(a)
}

type InventoryMsg struct {
	Inventory []DataInvPos        `mapstructure:"inv"`
	Equip     map[string]DataSlot `mapstructure:"equip"`
}

func (m *InventoryMsg) Run(obj GameObject) { log.Panic("InventoryMsg Run") }

type DataInvPos struct {
	X, Y int
	Item *Item
}
type DataSlot struct {
	Item   *Item
	Locked bool
}

func SendInventory(avatar *Avatar) {
	items := []DataInvPos{}
	for y, line := range avatar.Inventory {
		for x, item := range line {
			s := DataInvPos{x, y, nil}
			i, err := ItemByName(item)
			if err == nil {
				s.Item = i
			}
			items = append(items, s)
		}
	}

	equip := make(map[string]DataSlot)
	for k, v := range avatar.Equip {
		s := DataSlot{Locked: v.Locked}
		i, err := ItemByName(v.Item)
		if err == nil {
			s.Item = i
		}
		equip[k] = s
	}

	avatar.sendMessage <- &InventoryMsg{items, equip}
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

type ReplicaMsg struct {
	Tick    uint
	Added   []*AddMsg
	Removed []utils.Id
	Updated []*UpdateMsg
}

func (m *ReplicaMsg) ADD(obj GameObject) {
	msg := &AddMsg{
		//Tick:     r.tick,
		Type:     STATE_IDLE,
		Name:     obj.Name(),
		Id:       obj.Id(),
		Position: obj.Position(),
		Velocity: obj.Velocity(),
	}
	if msg.Velocity.X != 0 || msg.Velocity.Y != 0 {
		msg.Type = STATE_MOVE
	}
	if avatar, ok := obj.(*Avatar); ok {
		msg.Lag = avatar.Lag()
		msg.Type = avatar.state
	}
	msg.HP, msg.MHP = obj.HPbar()
	m.Added = append(m.Added, msg)
}

func (m *ReplicaMsg) RM(obj GameObject) {
	m.Removed = append(m.Removed, obj.Id())
}
func (m *ReplicaMsg) UPD(obj GameObject) {
	msg := &UpdateMsg{
		Type:     STATE_IDLE,
		Id:       obj.Id(),
		Position: obj.Position(),
		Velocity: obj.Velocity(),
	}
	if msg.Velocity.X != 0 || msg.Velocity.Y != 0 {
		msg.Type = STATE_MOVE
	}
	if avatar, ok := obj.(*Avatar); ok {
		msg.Lag = avatar.Lag()
		msg.Type = avatar.state
	}
	msg.HP, msg.MHP = obj.HPbar()
	m.Updated = append(m.Updated, msg)
}

type AddMsg struct {
	//Tick     uint
	Type     uint8
	Name     string
	Id       utils.Id
	Lag      time.Duration
	Position geom.Coord
	Velocity geom.Coord
	HP, MHP  int
	// TODO
}

//type RemoveMsg struct {
//Tick uint
//Id   utils.Id
//}

type UpdateMsg struct {
	//Tick     uint
	Type     uint8
	Id       utils.Id
	Lag      time.Duration
	Position geom.Coord
	Velocity geom.Coord
	HP, MHP  int
	// TODO
}

func (m *ReplicaMsg) Run(GameObject) { log.Panic("run") }

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
