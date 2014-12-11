package systems

import (
	. "oniproject/oni/artemis"
	"time"
)

/*
  The purpose of this class is to allow systems to execute at varying intervals.

  An example system would be an ExpirationSystem, that deletes entities after a certain
  lifetime. Instead of running a system that decrements a timeLeft value for each
  entity, you can simply use this system to execute in a future at a time of the shortest
  lived entity, and then reset the system to run at a time in a future at a time of the
  shortest lived entity, etc.

  Another example system would be an AnimationSystem. You know when you have to animate
  a certain entity, e.g. in 300 milliseconds. So you can set the system to run in 300 ms.
  to perform the animation.

  This will save CPU cycles in some scenarios.

  Implementation notes:
  In order to start the system you need to override the inserted(Entity e) method,
  look up the delay time from that entity and offer it to the system by using the
  offerDelay(float delay) method.
  Also, when processing the entities you must also call offerDelay(float delay)
  for all valid entities.


*/
type DelayedEntityProcessingSystem struct {
	*BaseSystem
	acc, delay time.Duration
	running    bool
}

func NewDelayedEntityProcessingSystem(aspect *Aspect) (sys *DelayedEntityProcessingSystem) {
	sys = &DelayedEntityProcessingSystem{}
	sys.BaseSystem = NewBaseSystem(aspect, sys)
	return
}

func (sys *DelayedEntityProcessingSystem) ProcessEntities(entities []Entity) {
	for _, entity := range entities {
		sys.ProcessDelta(entity, sys.acc)
		remaining := sys.RemainingDelay(entity)
		if remaining <= 0 {
			sys.ProcessExpired(entity)
		} else {
			sys.OfferDelay(remaining)
		}
	}
	sys.Stop()
}

func (sys *DelayedEntityProcessingSystem) Inserted(e Entity) {
	delay := sys.RemainingDelay(e)
	if delay > 0 {
		sys.OfferDelay(delay)
	}
}
func (sys *DelayedEntityProcessingSystem) Removed(e Entity) {}

// Return the delay until this entity should be processed.
func (sys *DelayedEntityProcessingSystem) RemainingDelay(e Entity) time.Duration { return 0 }

func (sys *DelayedEntityProcessingSystem) CheckProcessing() bool {
	if sys.running {
		sys.acc += sys.World().Delta()

		if sys.acc >= sys.delay {
			return true
		}
	}
	return false
}

/**
 * Process a entity this system is interested in. Substract the accumulatedDelta
 * from the entities defined delay.
 *
 * @param e the entity to process.
 * @param accumulatedDelta the delta time since this system was last executed.
 */
func (sys *DelayedEntityProcessingSystem) ProcessDelta(e Entity, accumulatedDelta time.Duration) {}

func (sys *DelayedEntityProcessingSystem) ProcessExpired(e Entity) {}

// Start processing of entities after a certain amount of delta time.
// Cancels current delayed run and starts a new one.
// @param delta time delay until processing starts.
func (sys *DelayedEntityProcessingSystem) Restart(delay time.Duration) {
	sys.delay = delay
	sys.acc = 0
	sys.running = true
}

/**
 * Restarts the system only if the delay offered is shorter than the
 * time that the system is currently scheduled to execute at.
 *
 * If the system is already stopped (not running) then the offered
 * delay will be used to restart the system with no matter its value.
 *
 * If the system is already counting down, and the offered delay is
 * larger than the time remaining, the system will ignore it. If the
 * offered delay is shorter than the time remaining, the system will
 * restart itself to run at the offered delay.
 *
 * @param delay
 */
func (sys *DelayedEntityProcessingSystem) OfferDelay(delay time.Duration) {
	if !sys.running || delay < sys.RemainingTimeUntilProcessing() {
		sys.Restart(delay)
	}
}

// Get the initial delay that the system was ordered to process entities after.
func (sys *DelayedEntityProcessingSystem) InitialTimeDelay() time.Duration { return sys.delay }

/**
 * Get the time until the system is scheduled to run at.
 * Returns zero (0) if the system is not running.
 * Use isRunning() before checking this value.
 *
 * @return time when system will run at.
 */
func (sys *DelayedEntityProcessingSystem) RemainingTimeUntilProcessing() time.Duration {
	if sys.running {
		return sys.delay - sys.acc
	}
	return 0
}

// Check if the system is counting down towards processing. true if it's counting down, false if it's not running.
func (sys *DelayedEntityProcessingSystem) IsRunning() bool { return sys.running }

// Stops the system from running, aborts current countdown. Call offerDelay or restart to run it again.
func (sys *DelayedEntityProcessingSystem) Stop() {
	sys.running = false
	sys.acc = 0
}
