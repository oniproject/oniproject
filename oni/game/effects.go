package game

import (
//	"strconv"
//	"strings"
)

type EffectReceiver interface {
	RecoverHP(float64)
	RecoverMP(float64)
	RecoverTP(float64)
	AddState(string)
	RemoveState(string)
}

/*
type EffectList []Effect

func (list EffectList) ApplyTo(r EffectReceiver) {
	for _, e := range list {
		e.ApplyTo(r)
	}
}

type Effect string

func (e Effect) ApplyTo(r EffectReceiver) {
	args := strings.Split(string(e), " ")
	name := args[0]
	value, _ := strconv.ParseInt(args[1], 10, 32)
	switch name {
	case "hp":
		r.RecoverHP(int(value))
	case "mp":
		r.RecoverMP(int(value))
	case "tp":
		r.RecoverTP(int(value))
	case "state":
		r.AddState(args[1])
	case "rm-state":
		r.RemoveState(args[1])
	}
	return
}*/
