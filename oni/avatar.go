package oni

import (
	"time"
)

const (
	STATE_IDLE = iota
	STATE_CREATE
	STATE_DESTROY
	STATE_MOVE
)

type State struct {
	Type      uint8
	Id        string
	Tick      uint
	Lag       time.Duration
	Position  Point
	Veloctity Point
}
type AvatarData struct {
	Id        Id
	MapId     Id
	Position  Point
	Veloctity Point
	lastvel   Point
}

type Mapper interface {
	Walkable(int, int) bool
	Unregister(*Avatar)
}

type Avatar struct {
	AvatarData
	AvatarConnection
	Target Id
	game   Mapper
}

func (a *Avatar) GetState(typ uint8, tick uint) *State {
	return &State{typ, a.Id.String(), tick, a.Lag, a.Position, a.Veloctity}
}

func (a *Avatar) Update(tick uint, t time.Duration) (state *State) {
	if a.Veloctity.X() != 0 || a.Veloctity.Y() != 0 {
		pos := Point{a.Position.X(), a.Position.Y()}
		for i := range a.Position {
			delta := a.Veloctity[i] * t.Seconds()
			pos[i] += delta
			a.lastvel[i] = a.Veloctity[i]
		}
		// XXX {nil} for testing
		if a.game == nil || a.game.Walkable(int(pos[0]), int(pos[1])) {
			a.Position = pos
		}
		state = a.GetState(STATE_MOVE, tick)
		return
	}

	if a.lastvel[0] != 0 || a.lastvel[1] != 0 {
		a.lastvel = [2]float64{0, 0}
		state = a.GetState(STATE_IDLE, tick)
	}

	return
}
