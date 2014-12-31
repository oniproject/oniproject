package game

import (
	"oniproject/oni/utils"
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

func (a *Monster) Name() string { return a.MonsterType }
func (a *Monster) Id() utils.Id { return a.id }
