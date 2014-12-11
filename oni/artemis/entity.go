package artemis

import (
	"fmt"
	"github.com/willf/bitset"
)

type Entity interface {
	// The internal id for this entity within the framework. No other entity
	// will have the same ID, but ID's are however reused so another entity may
	// acquire this ID if the previous entity was deleted.
	Id() int

	// Returns a BitSet instance containing bits of the components the entity possesses.
	ComponentBits() *bitset.BitSet
	// Returns a BitSet instance containing bits of the components the entity possesses.
	SystemBits() *bitset.BitSet
	String() string

	// Add a component to this entity.
	AddComponent(component Component)
	// Removes the component from this entity.
	RemoveComponent(component Component)

	/**
	 * This is the preferred method to use when retrieving a component from a
	 * entity. It will provide good performance.
	 * But the recommended way to retrieve components from an entity is using
	 * the ComponentMapper.
	 *
	 * @param type
	 *            in order to retrieve the component fast you must provide a
	 *            ComponentType instance for the expected component.
	 * @return
	 */
	ComponentByType(t *ComponentType) Component

	/* Returns a bag of all components this entity has.
	   You need to reset the bag yourself if you intend to fill it more than once.
	*/
	Components() []Component

	/* Checks if the entity has been added to the world and has not been deleted from it.
	   If the entity has been disabled this will still return true.
	*/
	IsActive() bool

	/* Will check if the entity is enabled in the world.
	   By default all entities that are added to world are enabled,
	   this will only return false if an entity has been explicitly disabled.
	*/
	IsEnabled() bool
}

//type UUID int64

// The entity class. Cannot be instantiated outside the framework, you must create new entities using World.
type entity struct {
	//uuid UUID
	id int

	componentBits *bitset.BitSet
	systemBits    *bitset.BitSet

	world *World

	entityManager    *EntityManager
	componentManager *ComponentManager
}

// for testing, etc.
func NewEntityVoid() Entity {
	return &entity{
		systemBits:    bitset.New(0),
		componentBits: bitset.New(0),
	}
}

func newEntity(world *World, id int) Entity {
	e := &entity{
		world:            world,
		id:               id,
		entityManager:    world.EntityManager(),
		componentManager: world.ComponentManager(),
		systemBits:       bitset.New(0),
		componentBits:    bitset.New(0),
	}
	e.reset()
	return e
}

func (e *entity) Id() int { return e.id }

func (e *entity) ComponentBits() *bitset.BitSet { return e.componentBits }
func (e *entity) SystemBits() *bitset.BitSet    { return e.systemBits }

// Make entity ready for re-use. Will generate a new uuid for the entity.
func (e *entity) reset() {
	e.systemBits.ClearAll()
	e.componentBits.ClearAll()
	//e.uuid = UUID.randomUUID()
}

func (e *entity) String() string {
	return fmt.Sprintf("Entity[%d]", e.id)
}

func (e *entity) AddComponent(component Component) {
	e.componentManager.AddComponent(e, component)
}
func (e *entity) RemoveComponent(component Component) {
	e.componentManager.RemoveComponent(e, getTypeFor(component))
}

func (e *entity) IsActive() bool  { return e.entityManager.IsActive(e.id) }
func (e *entity) IsEnabled() bool { return e.entityManager.IsEnabled(e.id) }

func (e *entity) ComponentByType(t *ComponentType) Component {
	return e.componentManager.ComponentByType(e, t)
}
func (e *entity) Components() []Component {
	return e.componentManager.ComponentsFor(e)
}

/*
  Refresh all changes to components for this entity. After adding or
  removing components, you must call this method. It will update all
  relevant systems. It is typical to call this after adding components to a
  newly created entity.
*/
func (e *entity) AddToWorld() { e.world.AddEntity(e) }

// This entity has changed, a component added or deleted.
func (e *entity) ChangedInWorld() { e.world.ChangedEntity(e) }

// Delete this entity from the world.
func (e *entity) DeleteFromWorld() { e.world.DeleteEntity(e) }

/* (Re)enable the entity in the world, after it having being disabled.
Won't do anything unless it was already disabled.
*/
func (e *entity) Enable() { e.world.EnableEntity(e) }

/* Disable the entity from being processed. Won't delete it, it will
continue to exist but won't get processed.
*/
func (e *entity) Disable() { e.world.DisableEntity(e) }

/* Get the UUID for this entity.
This UUID is unique per entity (re-used entities get a new UUID).
@return uuid instance for this entity.
*/
//func (e Entity) UUID() UUID { return e.uuid }

// Returns the world this entity belongs to.
func (e *entity) World() *World { return e.world }
