package game

import (
	"math/rand"
	"oniproject/oni/utils"
	"time"
)

type Monster struct {
	*Map

	PositionComponent
	StateComponent
	Parameters

	MonsterType string

	id utils.Id
}

func NewMonster(m *Map) *Monster {
	return &Monster{
		Map:            m,
		StateComponent: NewStateComponent(),
	}
}

func (a Monster) Name() string { return a.MonsterType }
func (a Monster) Id() utils.Id { return a.id }

func (m *Monster) RunAI() {
	t := time.NewTicker(1 * time.Second)
	for {
		select {
		case <-t.C:
			x := (rand.Float64() - 0.5) * 5
			y := (rand.Float64() - 0.5) * 5
			m.SetVelocity(x, y)
			// XXX
			m.Map.Physics.Sync(m)
		}
	}
}
