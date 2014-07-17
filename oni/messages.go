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
)

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
	}
	log.Printf("fail type %T %v", message, message)
	return message
}

func ParseMessage(_type uint8, value map[string]interface{}) (Message, error) {
	var md mapstructure.Metadata
	config := &mapstructure.DecoderConfig{
		Metadata:         &md,
		WeaklyTypedInput: true,
	}

	decode := func() error {
		decoder, err := mapstructure.NewDecoder(config)
		if err != nil {
			return err
		}
		if err := decoder.Decode(value); err != nil {
			return err
		}
		if len(md.Unused) != 0 {
			log.Println(md.Unused)
		}
		return nil
	}

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
	config.Result = message
	return message, decode()
}

type SetVelocityMsg struct {
	X       float64 `mapstructure:"x"`
	Y       float64 `mapstructure:"y"`
	NotUsed float64 `mapstructure:"z"`
}

func (m *SetVelocityMsg) Run(obj interface{}) {
	a := obj.(*Avatar)
	a.Veloctity = Point{m.X, m.Y}
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
	a.sendMessage <- WrapMessage(m)
	if a.Target == 0 {
		log.Println("fire FAIL: zero target", m)
		return
	}
	if a.Target == a.Id {
		log.Println("fire FAIL: is you id", m)
		return
	}
	log.Println("fire OK", m)
}
