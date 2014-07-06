package oni

import (
	"time"
)

type Point [2]float64

type State struct {
	Id        uint64        `json:"id"`
	Tick      uint          `json:"tick"`
	Lag       time.Duration `json:"lag"`
	Position  Point         `json:"x"`
	Veloctity Point         `json:"v"`
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
}

func (a *Avatar) GetState(tick uint) *State {
	return &State{uint64(a.Id), tick, a.Lag, a.Position, a.Veloctity}
}

func (a *Avatar) Update(tick uint, t time.Duration) (state *State) {
	if a.Veloctity[0] != 0 || a.Veloctity[1] != 0 {
		for i := range a.Position {
			delta := a.Veloctity[i] * t.Seconds()
			a.Position[i] += delta
			a.lastvel[i] = a.Veloctity[i]
		}
		state = a.GetState(tick)
		return
	}

	if a.lastvel[0] != 0 || a.lastvel[0] != 0 {
		a.lastvel = [2]float64{0, 0}
		state = a.GetState(tick)
	}

	return
}
