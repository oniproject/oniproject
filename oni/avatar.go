package oni

import (
	"github.com/skelterjohn/geom"
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
	Id        Id
	Tick      uint
	Lag       time.Duration
	Position  geom.Coord
	Veloctity geom.Coord
}
type AvatarData struct {
	Id        Id
	MapId     Id
	Position  geom.Coord
	Veloctity geom.Coord
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
	lastvel geom.Coord
}

func (a *Avatar) Id() Id {
	return a.data.Id
}

func (a *Avatar) Position() geom.Coord {
	return a.data.Position
}

func (a *Avatar) Send(m Message) {
	m.Run(a)
}

func (a *Avatar) GetState(typ uint8, tick uint) *State {
	return &State{typ, a.data.Id, tick, a.Lag, a.data.Position, a.data.Veloctity}
}

func (a *Avatar) Update(tick uint, t time.Duration) (state *State) {
	if a.data.Veloctity.X != 0 || a.data.Veloctity.Y != 0 {
		delta := a.data.Veloctity.Times(t.Seconds())
		pos := a.data.Position.Plus(delta)
		a.lastvel = a.data.Veloctity.Times(1) // just copy

		// XXX {nil} for testing
		if a.game == nil || a.game.Walkable(int(pos.X), int(pos.Y)) {
			a.data.Position = pos
		}
		state = a.GetState(STATE_MOVE, tick)
		return
	}

	if a.lastvel.X != 0 || a.lastvel.Y != 0 {
		a.lastvel = geom.Coord{0, 0}
		state = a.GetState(STATE_IDLE, tick)
	}

	// XXX for normal replication
	state = a.GetState(STATE_IDLE, tick)
	return
}
