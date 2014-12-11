package systems

import (
	. "oniproject/oni/artemis"
	"time"
)

/*
 If you need to process entities at a certain interval then use this.
 A typical usage would be to regenerate ammo or health at certain intervals, no need
 to do that every game loop, but perhaps every 100 ms. or every second.
*/
type IntervalEntityProcessingSystem struct {
	*IntervalEntitySystem
}

func NewIntervalEntityProcessingSystem(aspect *Aspect, interval time.Duration) *IntervalEntityProcessingSystem {
	return &IntervalEntityProcessingSystem{
		IntervalEntitySystem: NewIntervalEntitySystem(aspect, interval),
	}
}

// Process a entity this system is interested in.
func (sys *IntervalEntityProcessingSystem) Process(e Entity) {}
func (sys *IntervalEntityProcessingSystem) ProcessEntities(entities []Entity) {
	for _, e := range entities {
		sys.Process(e)
	}
}
