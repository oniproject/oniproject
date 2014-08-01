package oni

import (
	"github.com/skelterjohn/geom"
	"math/rand"
	"time"
)

type Monster struct {
	PositionComponent
	//data AvatarData
	//AvatarConnection
	Target Id
	game   AvatarMapper
	//lastvel geom.Coord

	id    Id
	MapId Id
	//position  geom.Coord
	//veloctity geom.Coord
	Lag time.Duration
}

func (a *Monster) Id() Id {
	return a.id
}

func (a *Monster) Position() geom.Coord {
	return a.position
}

func (a *Monster) Send(m Message) {
	m.Run(a)
}

func (a *Monster) GetState(typ uint8, tick uint) *State {
	return &State{typ, a.id, tick, a.Lag, a.position, a.veloctity}
}

func (m *Monster) Update(tick uint, t time.Duration) *State {
	m.veloctity.X = (rand.Float64() - 0.5) * 5
	m.veloctity.Y = (rand.Float64() - 0.5) * 5
	if m.PositionComponent.Update(m.game, t) {
		return m.GetState(STATE_MOVE, tick)
	} else {
		return m.GetState(STATE_IDLE, tick)
	}
}
