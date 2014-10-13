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

func (a *Monster) GetState(typ uint8, tick uint) *GameObjectState {
	return &GameObjectState{typ, a.id, tick, 0, a.position, a.veloctity}
}

func (m *Monster) Update(w Walkabler, tick uint, t time.Duration) *GameObjectState {
	if m.PositionComponent.Update(w, t) {
		return m.GetState(STATE_MOVE, tick)
	} else {
		return m.GetState(STATE_IDLE, tick)
	}
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
