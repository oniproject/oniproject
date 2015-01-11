package game

import (
	"github.com/oniproject/geom"
	"oniproject/oni/utils"
	"time"
)

const (
	STATE_IDLE = iota
	STATE_CAST
	STATE_DEAD
	STATE_MOVE
)

type Walkabler interface {
	Walkable(geom.Coord) bool
}

type EffectReceiver interface {
	RecoverHP(float64)
	RecoverMP(float64)
	RecoverTP(float64)
	AddState(string)
	RemoveState(string)
}

type FeatureReceiver interface {
	AddATK(float64)
	AddDEF(float64)
	AddSkill(string)
	SealSkill(string)
}

type GameObjectState struct {
	Type     uint8
	Id       utils.Id
	Lag      time.Duration
	Position geom.Coord
	Velocity geom.Coord
	HP, MHP  int
}

// +gen set
type GameObject interface {
	GetPositionComponent() *PositionComponent

	Position() geom.Coord
	Velocity() geom.Coord

	LastPosition() geom.Coord
	LastVelocity() geom.Coord

	SetPosition(x, y float64)
	SetVelocity(x, y float64)

	Id() utils.Id

	EffectReceiver

	HPbar() (int, int)
	MPbar() (int, int)
	TPbar() (int, int)
	Regeneration()

	Name() string

	MessageToMapInterface
}
