package game

import (
	"github.com/oniproject/geom"
	"oniproject/oni/utils"
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
	Id       utils.Id
	Lag      time.Duration
	Position geom.Coord
	Velocity geom.Coord
	HP, MHP  int
}

type GameObject interface {
	Update(w Walkabler, tick uint, t time.Duration) bool
	Position() geom.Coord
	Velocity() geom.Coord
	Lag() time.Duration
	Id() utils.Id

	SkillTarget

	HPbar() (int, int)
	MPbar() (int, int)
	TPbar() (int, int)
	Regeneration()

	Name() string
}

type PositionComponent struct {
	position geom.Coord
	velocity geom.Coord
	lastvel  geom.Coord
}

func NewPositionComponent(x, y float64) PositionComponent {
	return PositionComponent{position: geom.Coord{X: x, Y: y}}
}

func (c *PositionComponent) Position() geom.Coord     { return c.position }
func (c *PositionComponent) Velocity() geom.Coord     { return c.velocity }
func (c *PositionComponent) SetPosition(x, y float64) { c.position = geom.Coord{X: x, Y: y} }
func (c *PositionComponent) SetVelocity(x, y float64) {
	coord := geom.Coord{X: x, Y: y}
	c.velocity = coord.Unit()
}

func (c *PositionComponent) Update(w Walkabler, t time.Duration) bool {
	if c.velocity.X != 0 || c.velocity.Y != 0 {
		delta := c.velocity.Times(t.Seconds())
		pos := c.position.Plus(delta)
		c.lastvel = c.velocity.Times(1) // just copy

		// XXX {nil} for testing
		if w == nil || w.Walkable(pos) {
			c.position = pos
			return true
		}
		return false
	}

	if c.lastvel.X != 0 || c.lastvel.Y != 0 {
		c.lastvel = geom.Coord{X: 0, Y: 0}
		return true
	}

	return false
}
