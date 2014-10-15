package game

import (
	"errors"
	log "github.com/Sirupsen/logrus"
	"github.com/mitchellh/mapstructure"
	"oniproject/oni/utils"
)

type Sender interface {
	Send(utils.Id, Message)
}

type MessageToMapInterface interface {
	// XXX
	GetObjById(utils.Id) GameObject

	Sender
	Dropper
	Pickuper
}

// command
type Message interface {
	Run(MessageToMapInterface, interface{})
}

const (
	_ = iota
	// Client <-> Server only
	M_SetVelocityMsg
	M_SetTargetMsg

	M_CastMsg
	M_DestroyMsg

	M_DropItem
	M_PickupItem

	M_RequestInventory
	M_Inventory

	M_TargetData

	M_RequestParameters
	M_Parameters
)

// to client
func WrapMessage(message Message) interface{} {
	type MessageWraper struct {
		T uint8
		V interface{}
	}
	switch message.(type) {
	case *SetVelocityMsg:
		return &MessageWraper{M_SetVelocityMsg, message}
	case *SetTargetMsg:
		return &MessageWraper{M_SetTargetMsg, message}
	case *CastMsg:
		return &MessageWraper{M_CastMsg, message}
	case *DestroyMsg:
		return &MessageWraper{M_DestroyMsg, message}
	/*
		case *DropItemMsg:
			return &MessageWraper{M_DropItem, message}
		case *PickupItemMsg:
			return &MessageWraper{M_PickupItem, message}
	*/
	case *InventoryMsg:
		return &MessageWraper{M_Inventory, message}
		/*
			case *RequestInventoryMsg:
				return &MessageWraper{M_RequestInventory, message}
		*/
	case *TargetDataMsg:
		return &MessageWraper{M_TargetData, message}
	case *ParametersMsg:
		return &MessageWraper{M_Parameters, message}
	}
	log.Warningf("fail type %T %v", message, message)
	return message
}

// form client
func ParseMessage(_type uint8, value map[string]interface{}) (Message, error) {
	var message Message
	switch _type {
	case M_SetVelocityMsg:
		message = &SetVelocityMsg{}
	case M_SetTargetMsg:
		message = &SetTargetMsg{}
	case M_CastMsg:
		message = &CastMsg{}
	case M_DropItem:
		message = &DropItemMsg{}
	case M_PickupItem:
		message = &PickupItemMsg{}
	/*
		case M_Inventory:
			var mm InventoryMsg
			message = &mm
	*/
	case M_RequestInventory:
		message = &RequestInventoryMsg{}
	case M_RequestParameters:
		message = &RequestParametersMsg{}
	default:
		log.Error("ParseMessage fail type ", _type)
		return nil, errors.New("fail type")
	}

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
	log.Debug("setTarget ", a.Target)
	target := s.GetObjById(a.Target)
	if target == nil {
		log.Error("setTarget fail ", a.Target)
		return
	}
	hp, mhp := target.HPbar()
	a.sendMessage <- &TargetDataMsg{Race: target.Race(), HP: hp, MHP: mhp}
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
		log.Error("cast FAIL: fail target type [TARGET_MONSTER] ", m)
		return
	}

	if err := caster.Cast(m.Type, target); err != nil {
		log.Error("cast ", err)
		return
	}

	caster.RecoverHP(-skill.HPused)
	caster.RecoverMP(-skill.MPused)
	caster.RecoverTP(-skill.TPused)

	caster.sendMessage <- WrapMessage(&ParametersMsg{Parameters: caster.Parameters, Skills: caster.Skills})

	if target != caster {
		if avatar, ok := target.(*Avatar); ok {
			avatar.sendMessage <- WrapMessage(&ParametersMsg{Parameters: avatar.Parameters, Skills: avatar.Skills})
		}
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
		a.sendMessage <- WrapMessage(m)
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
	item := a.Inventory[m.Id]
	a.RemoveItem(m.Id)
	pos := a.Position()
	s.DropItem(pos.X, pos.Y, item)
}

type PickupItemMsg struct{}

func (m *PickupItemMsg) Run(s MessageToMapInterface, obj interface{}) {
	a := obj.(*Avatar)
	item := s.PickupItem(a.Target)
	if item == nil {
		log.Error("fail PickupItem: item notfound")
		return
	}
	a.AddItem(item)
}

type RequestInventoryMsg struct{}

func (m *RequestInventoryMsg) Run(s MessageToMapInterface, obj interface{}) {
	a := obj.(*Avatar)
	log.Debugf("RequestInventoryMsg %v %v", a.Inventory, a.Equip)
	a.sendMessage <- WrapMessage(&InventoryMsg{Inventory: a.Inventory, Equip: a.Equip})
}

type InventoryMsg struct {
	Inventory []*Item          `mapstructure:"inv"`
	Equip     map[string]*Item `mapstructure:"equip"`
}

func (m *InventoryMsg) Run(s MessageToMapInterface, obj interface{}) {
	log.Panic("InventoryMsg Run")
}

type TargetDataMsg struct {
	Race    int
	HP, MHP int
}

func (m *TargetDataMsg) Run(s MessageToMapInterface, obj interface{}) {
	log.Panic("TargetDataMsg Run")
}

type RequestParametersMsg struct{}

func (m *RequestParametersMsg) Run(s MessageToMapInterface, obj interface{}) {
	a := obj.(*Avatar)
	log.Debugf("RequestParametersMsg %v %v", a.Parameters, a.Skills)
	a.sendMessage <- WrapMessage(&ParametersMsg{Parameters: a.Parameters, Skills: a.Skills})
}

type ParametersMsg struct {
	Parameters Parameters
	Skills     map[string]*Skill
}

func (m *ParametersMsg) Run(s MessageToMapInterface, obj interface{}) {
	log.Panic("ParametersMsg Run")
}
