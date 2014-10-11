package game

import (
	"math/rand"
	"oniproject/oni/geom"
	"oniproject/oni/utils"
	"time"
)

type Monster struct {
	PositionComponent
	Target utils.Id
	game   AvatarMapper
	id     utils.Id
	Lag    time.Duration
}

func (a *Monster) Id() utils.Id {
	return a.id
}

func (a *Monster) Position() geom.Coord {
	return a.position
}

func (a *Monster) Send(m Message) {
	m.Run(a)
}

func (a *Monster) GetState(typ uint8, tick uint) *GameObjectState {
	return &GameObjectState{typ, a.id, tick, a.Lag, a.position, a.veloctity}
}

func (m *Monster) Update(tick uint, t time.Duration) *GameObjectState {
	m.veloctity.X = (rand.Float64() - 0.5) * 5
	m.veloctity.Y = (rand.Float64() - 0.5) * 5
	if m.PositionComponent.Update(m.game, t) {
		return m.GetState(STATE_MOVE, tick)
	} else {
		return m.GetState(STATE_IDLE, tick)
	}
}
