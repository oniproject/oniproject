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
	*BaseSystem
	acc, interval time.Duration
}

func NewIntervalEntitySystem(aspect *Aspect, interval time.Duration) (sys *IntervalEntitySystem) {
	sys = &IntervalEntitySystem{
		interval: interval,
	}
	sys.BaseSystem = NewBaseSystem(aspect, sys)
	return
}

// Process a entity this system is interested in.
func (sys *IntervalEntitySystem) CheckProcessing() bool {
	sys.acc += sys.World().Delta()
	if sys.acc >= sys.interval {
		sys.acc -= sys.interval
		return true
	}
	return false
}

func (sys *IntervalEntitySystem) ProcessEntities(entities []Entity) {}
func (sys *IntervalEntitySystem) Inserted(e Entity)                 {}
func (sys *IntervalEntitySystem) Removed(e Entity)                  {}
