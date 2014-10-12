package game

import (
	"oniproject/oni/geom"
	"oniproject/oni/utils"
	"time"
)

const (
	STATE_IDLE = iota
	STATE_CREATE
	STATE_DESTROY
	STATE_MOVE
)

type GameObjectState struct {
	Type      uint8
	Id        utils.Id
	Tick      uint
	Lag       time.Duration
	Position  geom.Coord
	Veloctity geom.Coord
}

type GameObject interface {
	Update(tick uint, t time.Duration) *GameObjectState
	GetState(typ uint8, tick uint) *GameObjectState
	Position() geom.Coord
	Send(Message)
	Id() utils.Id
}

type PositionComponent struct {
	position  geom.Coord
	veloctity geom.Coord
	lastvel   geom.Coord
}

func NewPositionComponent(x, y float64) PositionComponent {
	return PositionComponent{position: geom.Coord{x, y}}
}

func (c *PositionComponent) Position() geom.Coord { return c.position }
func (c *PositionComponent) Velocity() geom.Coord { return c.veloctity }
func (c *PositionComponent) SetVelocity(x, y float64) {
	coord := geom.Coord{x, y}
	c.veloctity = coord.Unit()
}

type Walkabler interface {
	Walkable(int, int) bool
}

func (c *PositionComponent) Update(w Walkabler, t time.Duration) bool {
	if c.veloctity.X != 0 || c.veloctity.Y != 0 {
		delta := c.veloctity.Times(t.Seconds())
		pos := c.position.Plus(delta)
		c.lastvel = c.veloctity.Times(1) // just copy

		// XXX {nil} for testing
		if w == nil || w.Walkable(int(pos.X), int(pos.Y)) {
			c.position = pos
		}
		return true
	}

	if c.lastvel.X != 0 || c.lastvel.Y != 0 {
		c.lastvel = geom.Coord{0, 0}
		return true
	}

	return false
}
