package oni

import "time"

type GameObject interface {
	Update(tick uint, t time.Duration) *State
	GetState(typ uint8, tick uint) *State
	Position() Point
	Send(Message)
	Id() Id
}
