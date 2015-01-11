package game

import (
	"github.com/oniproject/geom"
)

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
