package game

import (
	"errors"
	log "github.com/Sirupsen/logrus"
	"github.com/mitchellh/mapstructure"
	"oniproject/oni/utils"
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
		log.Debug("have unused", md.Unused, value)
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
	a.SetVelocity(m.X, m.Y)
}

type SetTargetMsg struct {
	Target utils.Id `mapstructure:"id"`
}

func (m *SetTargetMsg) Run(obj interface{}) {
	a := obj.(*Avatar)
	a.Target = m.Target
	log.Debug("setTarget", a.Target)
}

type FireMsg struct {
	Type uint64 `mapstructure:"t"`
}

func (m *FireMsg) Run(obj interface{}) {
	a := obj.(*Avatar)
	if a.Target == 0 {
		log.Warningf("fire FAIL: zero target", m)
		return
	}
	if a.Target == a.Id() {
		log.Warningf("fire FAIL: is you id", m)
		return
	}

	if m.Type == 0 {
		a.game.Send(utils.Id(a.Target), &CloseMsg{})
	} else {
		obj := a.game.GetObjById(a.Target).(*Avatar)
		log.Debug(a.data.Cast(int(m.Type), &obj.data))
	}

	log.Debug("fire OK", m)
}

type CloseMsg struct{}

func (m *CloseMsg) Run(obj interface{}) {
	log.Debug("UnregisterMsg", obj)
	a := obj.(*Avatar)
	a.ws.Close()
}

type DestroyMsg struct {
	Id utils.Id
	T  uint // tick
}

func (m *DestroyMsg) Run(obj interface{}) {
	if a, ok := obj.(*Avatar); ok {
		a.sendMessage <- WrapMessage(m)
	} else {
		log.Warningf("fail send: not a Avatar %T %v", obj, obj)
	}
}
