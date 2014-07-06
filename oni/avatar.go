package oni

import (
	"time"
)

type Point [2]float64

const (
	STATE_IDLE = iota
	STATE_CREATE
	STATE_DESTROY
	STATE_MOVE
)

type State struct {
	Type      uint8
	Id        uint64
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

type Avatar struct {
	AvatarData
	AvatarConnection
	game *Map
}

func (a *Avatar) GetState(typ uint8, tick uint) *State {
	return &State{typ, uint64(a.Id), tick, a.Lag, a.Position, a.Veloctity}
}

func (a *Avatar) Update(tick uint, t time.Duration) (state *State) {
	if a.Veloctity[0] != 0 || a.Veloctity[1] != 0 {
		pos := Point{a.Position[0], a.Position[1]}
		for i := range a.Position {
			delta := a.Veloctity[i] * t.Seconds()
			pos[i] += delta
			a.lastvel[i] = a.Veloctity[i]
		}
		if !a.game.Grid.IsWall(pos) {
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
