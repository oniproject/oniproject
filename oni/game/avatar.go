package game

import (
	"oniproject/oni/utils"
	"time"
)

type AvatarMapper interface {
	Walkable(int, int) bool
	Unregister(*Avatar)
	Send(utils.Id, Message)
	GetObjById(utils.Id) GameObject
}

type Avatar struct {
	PositionComponent
	Parameters
	Inventory
	AvatarConnection

	Target utils.Id
	data   Actor
	game   AvatarMapper
}

func (a Avatar) Id() utils.Id {
	return utils.Id(a.data.Id)
}

func (a *Avatar) Send(m Message) {
	m.Run(a)
}

func (a Avatar) GetState(typ uint8, tick uint) *GameObjectState {
	return &GameObjectState{typ, utils.Id(a.data.Id), tick, a.Lag, a.Position(), a.Velocity()}
}

func (a *Avatar) Update(tick uint, t time.Duration) (state *GameObjectState) {
	if a.PositionComponent.Update(a.game, t) {
		return a.GetState(STATE_MOVE, tick)
	} else {
		return a.GetState(STATE_IDLE, tick)
	}
}
