package oni

import (
	"errors"
	"github.com/mitchellh/mapstructure"
)

// command
type Message interface {
	Run(interface{})
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
		return nil
	}

	switch _type {
	case 1:
		var mm SetVelocityMsg
		config.Result = &mm
		return &mm, decode()
	default:
		return nil, errors.New("fail type")
	}
}

type SetVelocityMsg struct {
	X float64 `mapstructure:"x"`
	Y float64 `mapstructure:"y"`
}

func (m *SetVelocityMsg) Run(obj interface{}) {
	a := obj.(*Avatar)
	a.Veloctity = Point{m.X, m.Y}
}
