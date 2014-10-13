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
	case *DropItemMsg:
		return &MessageWraper{M_DropItem, message}
	case *PickupItemMsg:
		return &MessageWraper{M_PickupItem, message}
	case *InventoryMsg:
		return &MessageWraper{M_Inventory, message}
	case *RequestInventoryMsg:
		return &MessageWraper{M_RequestInventory, message}
	}
	log.Warningf("fail type %T %v", message, message)
	return message
}

// form client
func ParseMessage(_type uint8, value map[string]interface{}) (Message, error) {
	var message Message
	switch _type {
	case M_SetVelocityMsg:
		var mm SetVelocityMsg
		message = &mm
	case M_SetTargetMsg:
		var mm SetTargetMsg
		message = &mm
	case M_CastMsg:
		var mm CastMsg
		message = &mm
	case M_DropItem:
		var mm DropItemMsg
		message = &mm
	case M_PickupItem:
		var mm PickupItemMsg
		message = &mm
	case M_Inventory:
		var mm InventoryMsg
		message = &mm
	case M_RequestInventory:
		var mm RequestInventoryMsg
		message = &mm
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
}

type CastMsg struct {
	Type string `mapstructure:"t"`
}

func (m *CastMsg) Run(s MessageToMapInterface, obj interface{}) {
	a := obj.(*Avatar)
	if a.Target == 0 {
		log.Warningf("fire FAIL: zero target %v", m)
		return
	}
	if a.Target == a.Id() {
		log.Warningf("fire FAIL: is you id %v", m)
		return
	}

	if m.Type == "" {
		s.Send(utils.Id(a.Target), &CloseMsg{})
	} else {
		obj := s.GetObjById(a.Target)
		err := a.Cast(m.Type, a, obj)
		if err != nil {
			log.Error("cast ", err)
			return
		}
	}

	log.Info("fire OK ", m, " ", a.Target)
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

type RequestInventoryMsg struct {
	I string
}

func (m *RequestInventoryMsg) Run(s MessageToMapInterface, obj interface{}) {
	a := obj.(*Avatar)
	log.Printf("%q %q", a.Inventory, a.Equip)
	a.sendMessage <- WrapMessage(&InventoryMsg{Inventory: a.Inventory, Equip: a.Equip})
}

type InventoryMsg struct {
	Inventory []*Item          `mapstructure:"inv"`
	Equip     map[string]*Item `mapstructure:"equip"`
}

func (m *InventoryMsg) Run(s MessageToMapInterface, obj interface{}) {
	log.Panic("InventoryMsg Run")
}
