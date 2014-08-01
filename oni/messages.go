package oni

import (
	"errors"
	"github.com/mitchellh/mapstructure"
	"log"
)

// command
type Message interface {
	Run(interface{})
}

const (
	_ = iota
	// Client <-> Server only
	M_SetVelocityMsg
	M_SetTargetMsg
	M_FireMsg
	M_DestroyMsg
)

// to client
func WrapMessage(message interface{}) interface{} {
	type MessageWraper struct {
		T uint8
		V interface{}
	}
	switch message.(type) {
	case *SetVelocityMsg:
		return &MessageWraper{M_SetVelocityMsg, message}
	case *SetTargetMsg:
		return &MessageWraper{M_SetTargetMsg, message}
	case *FireMsg:
		return &MessageWraper{M_FireMsg, message}
	case *DestroyMsg:
		return &MessageWraper{M_DestroyMsg, message}
	}
	log.Printf("fail type %T %v", message, message)
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
	case M_FireMsg:
		var mm FireMsg
		message = &mm
	default:
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
		return nil, err
	}

	// init message form value
	if err := decoder.Decode(value); err != nil {
		return nil, err
	}

	// XXX debug
	if len(md.Unused) != 0 {
		log.Println("have unused", md.Unused, value)
	}

	return message, nil
}

type SetVelocityMsg struct {
	X       float64 `mapstructure:"x"`
	Y       float64 `mapstructure:"y"`
	NotUsed float64 `mapstructure:"z"`
}

func (m *SetVelocityMsg) Run(obj interface{}) {
	a := obj.(*Avatar)
	a.data.Veloctity.X = m.X
	a.data.Veloctity.Y = m.Y
}

type SetTargetMsg struct {
	Target uint64 `mapstructure:"id"`
}

func (m *SetTargetMsg) Run(obj interface{}) {
	a := obj.(*Avatar)
	a.Target = Id(m.Target)
	log.Println("setTarget", a.Target)
}

type FireMsg struct {
	Type uint64 `mapstructure:"t"`
}

func (m *FireMsg) Run(obj interface{}) {
	a := obj.(*Avatar)
	if a.Target == 0 {
		log.Println("fire FAIL: zero target", m)
		return
	}
	if a.Target == a.Id() {
		log.Println("fire FAIL: is you id", m)
		return
	}

	if m.Type == 0 {
		a.game.Send(Id(a.Target), &CloseMsg{})
	}

	log.Println("fire OK", m)
}

type CloseMsg struct{}

func (m *CloseMsg) Run(obj interface{}) {
	log.Println("UnregisterMsg", obj)
	a := obj.(*Avatar)
	a.ws.Close()
}

type DestroyMsg struct {
	Id string
	T  uint // tick
}

func (m *DestroyMsg) Run(obj interface{}) {
	a := obj.(*Avatar)
	a.sendMessage <- WrapMessage(m)
}
