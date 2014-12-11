package systems

import (
	. "oniproject/oni/artemis"
	"time"
)

/*
 A system that processes entities at a interval in milliseconds.
 A typical usage would be a collision system or physics system.
*/

type IntervalEntitySystem struct {
	*EntitySystem
	acc, interval time.Duration
	world         *World
}

func NewIntervalEntitySystem(aspect *Aspect, interval time.Duration) *IntervalEntitySystem {
	return &IntervalEntitySystem{
		EntitySystem: NewEntitySystem(aspect),
		interval:     interval,
	}
}

// Process a entity this system is interested in.
func (sys *IntervalEntitySystem) CheckProcessing() bool {
	sys.acc += sys.world.Delta()
	if sys.acc >= sys.interval {
		sys.acc -= sys.interval
		return true
	}
	return false
}
