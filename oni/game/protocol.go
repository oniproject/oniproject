package game

import (
	"bytes"
	"code.google.com/p/cbor/go"
	"github.com/mitchellh/mapstructure"
	"oniproject/oni/utils"
)

var CurrentProtocol MessageProtocol = &proto{}
var messages = utils.NewTypeIndexer()

type MessageProtocol interface {
	EncodeMessage(message Message) ([]byte, error)
	DecodeMessage(data []byte) (Message, error)
}

type proto struct{}

func (p *proto) EncodeMessage(message Message) ([]byte, error) {
	var val struct {
		T uint8
		V interface{}
	}
	val.T = uint8(messages.For(message))
	val.V = message

	buf := bytes.NewBuffer([]byte{})
	err := cbor.NewEncoder(buf).Encode(&val)
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

func (p *proto) DecodeMessage(data []byte) (Message, error) {
	var val struct {
		T uint8
		V map[string]interface{}
	}

	buf := bytes.NewBuffer(data)
	err := cbor.NewDecoder(buf).Decode(&val)
	if err != nil {
		return nil, err
	}

	message := messages.Create(uint(val.T)).(Message)

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
	if err := decoder.Decode(val.V); err != nil {
		return nil, err
	}

	return message, nil
}
