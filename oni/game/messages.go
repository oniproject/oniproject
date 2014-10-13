package game

import (
	"errors"
	log "github.com/Sirupsen/logrus"
	"github.com/mitchellh/mapstructure"
	"oniproject/oni/utils"
)

type Sender interface {
	Send(utils.Id, Message)
	// XXX
	GetObjById(utils.Id) GameObject
}

// command
type Message interface {
	Run(Sender, interface{})
}

const (
	_ = iota
	// Client <-> Server only
	M_SetVelocityMsg
	M_SetTargetMsg
	M_CastMsg
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
	case *CastMsg:
		return &MessageWraper{M_CastMsg, message}
	case *DestroyMsg:
		return &MessageWraper{M_DestroyMsg, message}
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
		log.Debug("have unused", md.Unused, value)
	}

	return message, nil
}

type SetVelocityMsg struct {
	X       float64 `mapstructure:"x"`
	Y       float64 `mapstructure:"y"`
	NotUsed float64 `mapstructure:"z"`
}

func (m *SetVelocityMsg) Run(s Sender, obj interface{}) {
	a := obj.(*Avatar)
	a.SetVelocity(m.X, m.Y)
}

type SetTargetMsg struct {
	Target utils.Id `mapstructure:"id"`
}

func (m *SetTargetMsg) Run(s Sender, obj interface{}) {
	a := obj.(*Avatar)
	a.Target = m.Target
	log.Debug("setTarget ", a.Target)
}

type CastMsg struct {
	Type string `mapstructure:"t"`
}

func (m *CastMsg) Run(s Sender, obj interface{}) {
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

func (m *CloseMsg) Run(s Sender, obj interface{}) {
	log.Debug("UnregisterMsg ", obj)
	a := obj.(*Avatar)
	a.ws.Close()
}

type DestroyMsg struct {
	Id utils.Id
	T  uint // tick
}

func (m *DestroyMsg) Run(s Sender, obj interface{}) {
	if a, ok := obj.(*Avatar); ok {
		a.sendMessage <- WrapMessage(m)
	} else {
		log.Warningf("fail send: not a Avatar %T %v", obj, obj)
	}
}
