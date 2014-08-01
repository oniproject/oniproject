package oni

import (
	"github.com/skelterjohn/geom"
	"time"
)

type GameObject interface {
	Update(tick uint, t time.Duration) *State
	GetState(typ uint8, tick uint) *State
	Position() geom.Coord
	Send(Message)
	Id() Id
}
