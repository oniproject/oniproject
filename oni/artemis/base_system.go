package artemis

import (
	"reflect"
)

type ChildSystem interface {
	// Called if the system has received a entity it is interested in, e.g. created or a component was added to it.
	Inserted(e Entity)
	// Called if a entity was removed from this system, e.g. deleted or had one of it's components removed.
	Removed(e Entity)
	// Any implementing entity system must implement this method and the logic to process the given entities of the system.
	ProcessEntities(entities []Entity)
	// return true if the system should be processed, false if not.
	CheckProcessing() bool
}

/**
 * The most raw entity system. It should not typically be used, but you can create your own
 * entity system handling by extending this. It is recommended that you use the other provided
 * entity system implementations.
 */
type BaseSystem struct {
	systemIndex uint
	actives     []Entity
	passive     bool
	dummy       bool

	*Aspect

	child ChildSystem

	BaseWorldSaver
	BaseInitializer
}

// Creates an entity system that uses the specified aspect as a matcher against entities.
func NewBaseSystem(aspect *Aspect, child ChildSystem) (sys *BaseSystem) {
	sys = &BaseSystem{
		Aspect: aspect,
		child:  child,
	}

	sys.systemIndex = _SystemIndexManager.getIndexFor(sys)
	// This system can't possibly be interested in any entity, so it must be "dummy"
	sys.dummy = sys.allSet.Len() == 0 && sys.oneSet.Len() == 0
	return
}

func (sys *BaseSystem) Process() {
	if sys.child.CheckProcessing() {
		sys.child.ProcessEntities(sys.actives)
	}
}

// Will check if the entity is of interest to this system.
func (sys *BaseSystem) check(e Entity) {
	if sys.dummy {
		return
	}

	contains := e.SystemBits().Test(sys.systemIndex)
	interested := true // possibly interested, let's try to prove it wrong.

	componentBits := e.ComponentBits()

	// Check if the entity possesses ALL of the components defined in the aspect.
	if sys.allSet.Len() > 0 {
		for i, ok := sys.allSet.NextSet(0); ok; i, ok = sys.allSet.NextSet(i + 1) {
			if !componentBits.Test(i) {
				interested = false
				break
			}
		}
	}

	// Check if the entity possesses ANY of the exclusion components, if it does then the system is not interested.
	if sys.exclusionSet.Len() > 0 && interested {
		interested = !sys.exclusionSet.Intersection(componentBits).Any()
	}

	// Check if the entity possesses ANY of the components in the oneSet. If so, the system is interested.
	if sys.oneSet.Len() > 0 {
		interested = sys.oneSet.Intersection(componentBits).Any()
	}

	if interested && !contains {
		sys.insertToSystem(e)
	} else if !interested && contains {
		sys.removeFromSystem(e)
	}
}

func (sys *BaseSystem) removeFromSystem(e Entity) {
	for i, other := range sys.actives {
		if other == e {
			sys.actives = append(sys.actives[:i], sys.actives[i+1:]...)
			break
		}
	}
	e.SystemBits().Clear(sys.systemIndex)
	sys.child.Removed(e)
}

func (sys *BaseSystem) insertToSystem(e Entity) {
	sys.actives = append(sys.actives, e)
	e.SystemBits().Set(sys.systemIndex)
	sys.child.Inserted(e)
}

func (sys *BaseSystem) Added(e Entity)   { sys.check(e) }
func (sys *BaseSystem) Changed(e Entity) { sys.check(e) }

func (sys *BaseSystem) Deleted(e Entity) {
	if e.SystemBits().Test(sys.systemIndex) {
		sys.removeFromSystem(e)
	}
}

func (sys *BaseSystem) Disabled(e Entity) {
	if e.SystemBits().Test(sys.systemIndex) {
		sys.removeFromSystem(e)
	}
}

func (sys *BaseSystem) Enabled(e Entity)        { sys.check(e) }
func (sys *BaseSystem) IsPassive() bool         { return sys.passive }
func (sys *BaseSystem) SetPassive(passive bool) { sys.passive = passive }
func (sys *BaseSystem) Actives() []Entity       { return sys.actives }

// Used to generate a unique bit for each system. Only used internally in BaseSystem.
var _SystemIndexManager = SystemIndexManager{
	INDEX:   0,
	indices: make(map[reflect.Type]uint),
}

type SystemIndexManager struct {
	INDEX   uint
	indices map[reflect.Type]uint
}

func (m *SystemIndexManager) getIndexFor(es System) uint {
	t := reflect.TypeOf(es)
	index, ok := m.indices[t]
	if !ok {
		m.INDEX++
		index = m.INDEX
		m.indices[t] = index
	}
	return index
}
