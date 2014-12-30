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

type GameObject interface {
	GetPositionComponent() *PositionComponent

	Position() geom.Coord
	Velocity() geom.Coord

	LastPosition() geom.Coord
	LastVelocity() geom.Coord

	SetPosition(x, y float64)
	SetVelocity(x, y float64)

	Id() utils.Id

	SkillTarget

	HPbar() (int, int)
	MPbar() (int, int)
	TPbar() (int, int)
	Regeneration()

	Name() string

	MessageToMapInterface
}

type PositionComponent struct {
	Pos     geom.Coord
	vel     geom.Coord
	lastpos geom.Coord
	lastvel geom.Coord
}

func NewPositionComponent(x, y float64) PositionComponent {
	return PositionComponent{Pos: geom.Coord{X: x, Y: y}}
}

func (c *PositionComponent) GetPositionComponent() *PositionComponent { return c }

func (c *PositionComponent) Position() geom.Coord { return c.Pos }
func (c *PositionComponent) Velocity() geom.Coord { return c.vel }

func (c *PositionComponent) LastPosition() geom.Coord { return c.lastpos }
func (c *PositionComponent) LastVelocity() geom.Coord { return c.lastvel }

func (c *PositionComponent) SetPosition(x, y float64) {
	c.lastpos = c.Pos
	c.Pos = geom.Coord{X: x, Y: y}
}
func (c *PositionComponent) SetVelocity(x, y float64) {
	c.lastvel = c.vel
	c.vel = geom.Coord{X: x, Y: y}
}
