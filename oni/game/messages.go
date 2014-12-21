package game

import (
	log "github.com/Sirupsen/logrus"
	"github.com/mitchellh/mapstructure"
	"github.com/oniproject/geom"
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

	Sender
	Dropper
}

// command
type Message interface {
	Run(MessageToMapInterface, interface{})
}

var messages = utils.NewTypeIndexer()

func init() {
	m := []interface{}{
		0, // pass
		&SetVelocityMsg{},
		&SetTargetMsg{},

		&CastMsg{},
		&DestroyMsg{},

		&DropItemMsg{},
		&PickupItemMsg{},

		&RequestInventoryMsg{},
		&InventoryMsg{},

		&TargetDataMsg{},

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

// to client
func WrapMessage(message Message) interface{} {
	type MessageWraper struct {
		T uint8
		V interface{}
	}
	id := uint8(messages.For(message))
	return &MessageWraper{id, message}
}

// form client
func ParseMessage(_type uint8, value map[string]interface{}) (Message, error) {
	message := messages.Create(uint(_type)).(Message)

	var md mapstructure.Metadata
	config := &mapstructure.DecoderConfig{
		Metadata:         &md,
		WeaklyTypedInput: true,
		Result:           message,
	}
	decoder, err := mapstructure.NewDecoder(config)
	if err != nil {
		log.Error("ParseMessage mapstructure ", err)
		return nil, err
	}

	// init message form value
	if err := decoder.Decode(value); err != nil {
		log.Error("ParseMessage decode ", err)
		return nil, err
	}

	// XXX debug
	if len(md.Unused) != 0 {
		log.Warn("have unused", md.Unused, value)
	}

	return message, nil
}

type SetVelocityMsg struct {
	X       float64 `mapstructure:"x"`
	Y       float64 `mapstructure:"y"`
	NotUsed float64 `mapstructure:"z"`
}

func (m *SetVelocityMsg) Run(s MessageToMapInterface, obj interface{}) {
	a := obj.(*Avatar)
	a.SetVelocity(m.X, m.Y)
}

type SetTargetMsg struct {
	Target utils.Id `mapstructure:"id"`
}

func (m *SetTargetMsg) Run(s MessageToMapInterface, obj interface{}) {
	a := obj.(*Avatar)
	a.Target = m.Target

	msg := &TargetDataMsg{Id: a.Target, Race: 0, HP: 0, MHP: 0, Name: ""}

	defer func() {
		msg.Id = a.Target
		a.sendMessage <- msg
	}()

	target := s.GetObjById(a.Target)
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
	msg.Race = target.Race()
}

type CastMsg struct {
	Type string `mapstructure:"t"`
}

func (m *CastMsg) Run(s MessageToMapInterface, obj interface{}) {
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

	target := s.GetObjById(caster.Target)

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

	switch {
	case caster.Race() == target.Race() && skill.Target&TARGET_SAME_RACE == 0:
		log.Error("cast FAIL: fail target type [TARGET_SAME_RACE] ", m)
		return
	case caster == target && skill.Target&TARGET_SELF == 0:
		log.Error("cast FAIL: fail target type [TARGET_SELF] ", m)
		return
	case target.Race() == 0 && skill.Target&TARGET_MONSTER == 0:
		log.Error("cast FAIL: fail target type [TARGET_MONSTER] ", m, skill.Target, TARGET_MONSTER)
		return
	}

	if err := caster.Cast(m.Type, target); err != nil {
		log.Error("cast ", err)
		return
	}

	caster.RecoverHP(float64(-skill.HPused))
	caster.RecoverMP(float64(-skill.MPused))
	caster.RecoverTP(float64(-skill.TPused))

	//caster.sendMessage <- &ParametersMsg{Parameters: caster.Parameters, Skills: caster.Skills}

	if hp, _ := target.HPbar(); hp == 0 {
		switch t := target.(type) {
		case *Avatar:
			t.HRG = 0
		case *Monster:
			t.HRG = 0
		}
		s.Unregister(target)
	}

	if target != caster {
		hp, mhp := target.HPbar()
		caster.sendMessage <- &TargetDataMsg{Race: target.Race(), HP: hp, MHP: mhp, Name: target.Name()}
	}

	log.Infof("cast OK: %v %d", m, caster.Target)
}

type CloseMsg struct{}

func (m *CloseMsg) Run(s MessageToMapInterface, obj interface{}) {
	log.Debug("UnregisterMsg ", obj)
	a := obj.(*Avatar)
	a.ws.Close()
}

type DestroyMsg struct {
	Id utils.Id
	T  uint // tick
}

func (m *DestroyMsg) Run(s MessageToMapInterface, obj interface{}) {
	if a, ok := obj.(*Avatar); ok {
		a.sendMessage <- m
	} else {
		log.Warningf("fail send: not a Avatar %T %v", obj, obj)
	}
}

type DropItemMsg struct {
	Id int
}

func (m *DropItemMsg) Run(s MessageToMapInterface, obj interface{}) {
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
	s.DropItem(pos.X, pos.Y, name)

	SendInventory(a)
}

type PickupItemMsg struct {
	Target utils.Id `mapstructure:"t"`
}

func (m *PickupItemMsg) Run(s MessageToMapInterface, obj interface{}) {
	a := obj.(*Avatar)
	if obj := s.GetObjById(a.Target); obj != nil {
		if item, ok := obj.(*DroppedItem); ok {
			err := a.AddItem(item.Item, 0, 0)
			if err == nil {
				s.Unregister(obj)

				SendInventory(a)
				return
			}
		}
	}

	log.Error("FAIL PickupItem")
	return
}

type RequestInventoryMsg struct{}

func (m *RequestInventoryMsg) Run(s MessageToMapInterface, obj interface{}) {
	a := obj.(*Avatar)
	log.Debugf("RequestInventoryMsg %v %v", a.Inventory, a.Equip)
	SendInventory(a)
}

type InventoryMsg struct {
	Inventory []DataInvPos        `mapstructure:"inv"`
	Equip     map[string]DataSlot `mapstructure:"equip"`
}

func (m *InventoryMsg) Run(s MessageToMapInterface, obj interface{}) {
	log.Panic("InventoryMsg Run")
}

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

func (m *TargetDataMsg) Run(s MessageToMapInterface, obj interface{}) {
	log.Panic("TargetDataMsg Run")
}

type RequestParametersMsg struct{}

func (m *RequestParametersMsg) Run(s MessageToMapInterface, obj interface{}) {
	a := obj.(*Avatar)
	log.Debugf("RequestParametersMsg %v %v", a.Parameters, a.Skills)
	a.sendMessage <- &ParametersMsg{Parameters: a.Parameters, Skills: a.Skills}
}

type ParametersMsg struct {
	Parameters Parameters
	Skills     map[string]*Skill
}

func (m *ParametersMsg) Run(s MessageToMapInterface, obj interface{}) {
	log.Panic("ParametersMsg Run")
}

type ChatMsg struct {
	Type string `mapstructure:"type"`
	Text string `mapstructure:"text"`
	Id   int64  `mapstructure:"id"`
	Name string `mapstructure:"name"`
}

func (m *ChatMsg) Run(s MessageToMapInterface, obj interface{}) {
	log.Panic("ChatMsg Run")
}

type ChatPostMsg struct {
	Msg string `mapstructure:"m"`
}

func (m *ChatPostMsg) Run(s MessageToMapInterface, obj interface{}) {
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
		Lag:      obj.Lag(),
		Position: obj.Position(),
		Velocity: obj.Velocity(),
	}
	if msg.Velocity.X != 0 || msg.Velocity.Y != 0 {
		msg.Type = STATE_MOVE
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
		Lag:      obj.Lag(),
		Position: obj.Position(),
		Velocity: obj.Velocity(),
	}
	if msg.Velocity.X != 0 || msg.Velocity.Y != 0 {
		msg.Type = STATE_MOVE
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

func (m *ReplicaMsg) Run(MessageToMapInterface, interface{}) { log.Panic("run") }

//func (m *AddMsg) Run(MessageToMapInterface, interface{})     { log.Panic("run") }
//func (m *RemoveMsg) Run(MessageToMapInterface, interface{})  { log.Panic("run") }
//func (m *UpdateMsg) Run(MessageToMapInterface, interface{})  { log.Panic("run") }
