package game

import (
	"github.com/oniproject/geom"
	. "oniproject/oni/artemis"
	"time"
)

var POSITION = GetIndexFor((*PositionComponent)(nil))

type PositionComponent struct {
	position geom.Coord
	velocity geom.Coord
	lastvel  geom.Coord
	mapId    string
}

func NewPositionComponent(x, y float64) PositionComponent {
	return PositionComponent{position: geom.Coord{X: x, Y: y}}
}

func (c *PositionComponent) Name() string { return "position" }

func (c *PositionComponent) MapId() string              { return c.mapId }
func (c *PositionComponent) SetMapId(id string)         { c.mapId = id }
func (c *PositionComponent) Position() geom.Coord       { return c.position }
func (c *PositionComponent) Velocity() geom.Coord       { return c.velocity }
func (c *PositionComponent) SetPosition(pos geom.Coord) { c.position = pos }
func (c *PositionComponent) SetVelocity(vel geom.Coord) { c.velocity = vel }

func (c *PositionComponent) Update(w Walkabler, t time.Duration) bool {
	panic("refactoring PositionComponent Update")
	/*
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
	*/
}

type PositionSystem struct {
	*BaseSystem
	Walkabler
}

func NewPositionSystem(w Walkabler) (sys *PositionSystem) {
	sys = &PositionSystem{
		Walkabler: w,
	}
	sys.BaseSystem = NewBaseSystem(NewAspectFor((*PositionComponent)(nil)), sys)
	return
}

func (sys *PositionSystem) Inserted(e Entity)     {}
func (sys *PositionSystem) Removed(e Entity)      {}
func (sys *PositionSystem) CheckProcessing() bool { return true }
func (sys *PositionSystem) ProcessEntities(entities []Entity) {
	for _, e := range entities {
		pos := e.ComponentByType(POSITION).(*PositionComponent)
		if sys.update(pos, TickRate) {
			e.ChangedInWorld()
		}
	}
}

func (sys *PositionSystem) update(c *PositionComponent, t time.Duration) bool {
	if c.velocity.X != 0 || c.velocity.Y != 0 {
		delta := c.velocity.Times(t.Seconds())
		pos := c.position.Plus(delta)
		c.lastvel = c.velocity.Times(1) // just copy

		// XXX {nil} for testing
		if sys.Walkabler == nil || sys.Walkable(pos) {
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
