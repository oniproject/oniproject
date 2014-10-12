package game

import (
	"math/rand"
	"oniproject/oni/utils"
	"time"
)

type Monster struct {
	PositionComponent
	StateComponent
	Parameters
	Target utils.Id
	game   AvatarMapper
	id     utils.Id
}

func NewMonster() *Monster {
	return &Monster{
		StateComponent: NewStateComponent(),
	}
}

func (a Monster) Lag() time.Duration { return 0 }
func (a Monster) Id() utils.Id       { return a.id }
func (a Monster) Race() int          { return 0 }
func (a *Monster) Send(m Message)    { m.Run(a) }

func (a *Monster) GetState(typ uint8, tick uint) *GameObjectState {
	return &GameObjectState{typ, a.id, tick, 0, a.position, a.veloctity}
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
