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

	id utils.Id
}

func NewMonster() *Monster {
	return &Monster{
		StateComponent: NewStateComponent(),
	}
}

func (a Monster) Lag() time.Duration { return 0 }
func (a Monster) Id() utils.Id       { return a.id }
func (a Monster) Race() int          { return 0 }

func (m *Monster) Update(w Walkabler, tick uint, t time.Duration) bool {
	return m.PositionComponent.Update(w, t)
}

func (m *Monster) RunAI() {
	t := time.NewTicker(1 * time.Second)
	for {
		select {
		case <-t.C:
			x := (rand.Float64() - 0.5) * 5
			y := (rand.Float64() - 0.5) * 5
			m.SetVelocity(x, y)
		}
	}
}
