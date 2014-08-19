package oni

import (
	"github.com/skelterjohn/geom"
	"oniproject/oni/mechanic"
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

type AvatarMapper interface {
	Walkable(int, int) bool
	Unregister(*Avatar)
	Send(Id, Message)
	GetObjById(Id) GameObject
}

type Avatar struct {
	PositionComponent
	data mechanic.Actor
	AvatarConnection
	Target Id
	game   AvatarMapper
}

func (a Avatar) Id() Id {
	return Id(a.data.Id)
}

func (a *Avatar) Send(m Message) {
	m.Run(a)
}

func (a Avatar) GetState(typ uint8, tick uint) *State {
	return &State{typ, Id(a.data.Id), tick, a.Lag, a.Position(), a.Velocity()}
}

func (a *Avatar) Update(tick uint, t time.Duration) (state *State) {
	if a.PositionComponent.Update(a.game, t) {
		return a.GetState(STATE_MOVE, tick)
	} else {
		return a.GetState(STATE_IDLE, tick)
	}
}
