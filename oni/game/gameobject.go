package game

import (
	"github.com/oniproject/geom"
	"oniproject/oni/artemis"
	. "oniproject/oni/utils"
	"time"
)

const (
	STATE_IDLE = iota
	STATE_CREATE
	STATE_DESTROY
	STATE_MOVE
)

type Walkabler interface {
	Walkable(geom.Coord) bool
}

type GameObjectState struct {
	Type     uint8
	Id       Id
	Lag      time.Duration
	Position geom.Coord
	Velocity geom.Coord
	HP, MHP  int
}

type GameObject interface {
	artemis.Entity

	Update(w Walkabler, tick uint, t time.Duration) bool
	Position() geom.Coord
	Velocity() geom.Coord
	Lag() time.Duration

	GetPositionComponent() *PositionComponent

	SkillTarget

	HPbar() (int, int)
	MPbar() (int, int)
	TPbar() (int, int)
	Regeneration()

	Name() string
}
