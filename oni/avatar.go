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
}

type AvatarMapper interface {
	Walkable(int, int) bool
	Unregister(*Avatar)
	Send(Id, Message)
}

type Avatar struct {
	data AvatarData
	AvatarConnection
	Target  Id
	game    AvatarMapper
	lastvel Point
}

func (a *Avatar) Id() Id {
	return a.data.Id
}

func (a *Avatar) Position() Point {
	return a.data.Position
}

func (a *Avatar) Send(m Message) {
	m.Run(a)
}

func (a *Avatar) GetState(typ uint8, tick uint) *State {
	return &State{typ, a.data.Id.String(), tick, a.Lag, a.data.Position, a.data.Veloctity}
}

func (a *Avatar) Update(tick uint, t time.Duration) (state *State) {
	if a.data.Veloctity.X() != 0 || a.data.Veloctity.Y() != 0 {
		pos := Point{a.data.Position.X(), a.data.Position.Y()}
		for i := range pos {
			delta := a.data.Veloctity[i] * t.Seconds()
			pos[i] += delta
			a.lastvel[i] = a.data.Veloctity[i]
		}
		// XXX {nil} for testing
		if a.game == nil || a.game.Walkable(int(pos[0]), int(pos[1])) {
			a.data.Position = pos
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
