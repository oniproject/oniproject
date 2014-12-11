package artemis

import (
	"reflect"
	"time"
)

type EntityObserver interface {
	Added(e Entity)
	Changed(e Entity)
	Deleted(e Entity)
	Enabled(e Entity)
	Disabled(e Entity)
}

type Manager interface {
	EntityObserver
	SetWorld(world *World)
	Initialize()
}

type System interface {
	EntityObserver

	SetWorld(world *World)
	Initialize()

	SetPassive(p bool)
	IsPassive() bool
	Process()
}

/* The primary instance for the framework. It contains all the managers.

You must use this to create, delete and retrieve entities.

It is also important to set the delta each game loop iteration, and initialize before game loop.
*/
type World struct {
	em *EntityManager
	cm *ComponentManager

	delta time.Duration

	added, changed, deleted, enable, disable []Entity

	managers    map[reflect.Type]Manager
	managersArr []Manager

	systems    map[reflect.Type]System
	systemsArr []System
}

func NewWorld() (w *World) {
	w = &World{
		cm:       NewComponentManager(),
		em:       NewEntityManager(),
		managers: make(map[reflect.Type]Manager),
		systems:  make(map[reflect.Type]System),
	}

	w.SetManager(w.em)
	w.SetManager(w.cm)

	return
}

// Delta time since last game loop.
func (w *World) Delta() time.Duration { return w.delta }

// You must specify the delta for the game here.
func (w *World) SetDelta(delta time.Duration) { w.delta = delta }

// Get a entity having the specified id.
func (w *World) EntityById(entityId int) Entity { return w.em.EntityById(entityId) }

// Makes sure all managers systems are initialized in the order they were added.
func (w *World) Initialize() {
	for _, manager := range w.managersArr {
		manager.Initialize()
	}
	for _, sys := range w.systemsArr {
		// FIXME
		//ComponentMapperInitHelper.config(sys, w)
		sys.Initialize()
	}
}

// Returns a manager that takes care of all the entities in the world. entities of this world.
func (w *World) EntityManager() *EntityManager { return w.em }

// Returns a manager that takes care of all the components in the world.
func (w *World) ComponentManager() *ComponentManager { return w.cm }

// Gives you all the managers in this world for possible iteration.
func (w *World) Managers() []Manager { return w.managersArr }

// Add a manager into this world. It can be retrieved later. World will notify this manager of changes to entity.
func (w *World) SetManager(manager Manager) Manager {
	w.managers[reflect.TypeOf(manager)] = manager
	w.managersArr = append(w.managersArr, manager)
	manager.SetWorld(w)
	return manager
}

// Returns a manager of the specified type.
func (w *World) ManagerByType(t reflect.Type) Manager {
	return w.managers[t]
}

// Deletes the manager from this world.
func (w *World) DeleteManager(manager Manager) {
	delete(w.managers, reflect.TypeOf(manager))
	for i, other := range w.managersArr {
		if other == manager {
			w.managersArr = append(w.managersArr[:i], w.managersArr[i+1:]...)
			break
		}
	}
}

// Gives you all the systems in this world for possible iteration.
func (w *World) Systems() []System { return w.systemsArr }

/* Will add a system to this world.

param system the system to add.
param passive wether or not this system will be processed by World.process()
return the added system.
*/
func (w *World) SetSystem(system System, passive bool) System {
	system.SetWorld(w)
	system.SetPassive(passive)

	w.systems[reflect.TypeOf(system)] = system
	w.systemsArr = append(w.systemsArr, system)

	return system
}

// Removed the specified system from the world.
func (w *World) DeleteSystem(system System) {
	delete(w.systems, reflect.TypeOf(system))

	for i, other := range w.systemsArr {
		if other == system {
			w.systemsArr = append(w.systemsArr[:i], w.systemsArr[i+1:]...)
			break
		}
	}
}

// Retrieve a system for specified system type.
func (w *World) SystemByType(t reflect.Type) System { return w.systems[t] }

// Process all non-passive systems.
func (w *World) Process() {
	w.check(w.added, func(observer EntityObserver, e Entity) {
		observer.Added(e)
	})
	w.check(w.changed, func(observer EntityObserver, e Entity) {
		observer.Changed(e)
	})
	w.check(w.disable, func(observer EntityObserver, e Entity) {
		observer.Disabled(e)
	})
	w.check(w.enable, func(observer EntityObserver, e Entity) {
		observer.Enabled(e)
	})
	w.check(w.deleted, func(observer EntityObserver, e Entity) {
		observer.Deleted(e)
	})

	w.cm.Clean()

	for _, sys := range w.systemsArr {
		if !sys.IsPassive() {
			sys.Process()
		}
	}
}

// Adds a entity to this world.
func (w *World) addEntity(e Entity) { w.added = append(w.added, e) }

/* Ensure all systems are notified of changes to this entity.
If you're adding a component to an entity after it's been
added to the world, then you need to invoke this method.
*/
func (w *World) changedEntity(e Entity) { w.changed = append(w.changed, e) }

// Delete the entity from the world.
func (w *World) deleteEntity(e Entity) {
	for _, other := range w.deleted {
		if e == other {
			return
		}
	}

	w.deleted = append(w.deleted, e)
}

// Only used internally to maintain clean code.
type perf func(observer EntityObserver, e Entity)

// Performs an action on each entity.
func (w *World) check(entities []Entity, performer perf) {
	for _, e := range entities {
		w.notifyManagers(performer, e)
		w.notifySystems(performer, e)
	}
	//FIXME entities.Clear()
}

func (w *World) notifySystems(performer perf, e Entity) {
	for _, system := range w.systemsArr {
		performer(system, e)
	}
}

func (w *World) notifyManagers(performer perf, e Entity) {
	for _, manager := range w.managersArr {
		performer(manager, e)
	}
}

/* (Re)enable the entity in the world, after it having being disabled.
   Won't do anything unless it was already disabled.
*/
func (w *World) enableEntity(e Entity) { w.enable = append(w.enable, e) }

// Disable the entity from being processed. Won't delete it, it will continue to exist but won't get processed.
func (w *World) disableEntity(e Entity) { w.disable = append(w.disable, e) }

/* Create and return a new or reused entity instance.
   Will NOT add the entity to the world, use World.addEntity(Entity) for that.
*/
func (w *World) createEntity() Entity { return w.em.CreateEntityInstance() }

/* Retrieves a ComponentMapper instance for fast retrieval of components from entities.

param type of component to get mapper for.
return mapper for specified component type.
*/
func (w *World) Mapper(t reflect.Type) *ComponentMapper {
	return NewComponentMapper(t, w)
}

/* TODO
func ComponentMapperInitHelperConfig(target interface{}, world World) {
	defer func() {}()

	t := reflect.TypeOf(target)


}


private static class ComponentMapperInitHelper {

	public static void config(Object target, World world) {
		try {
			Class<?> clazz = target.getClass();
			for (Field field : clazz.getDeclaredFields()) {
				Mapper annotation = field.getAnnotation(Mapper.class);
				if (annotation != null && Mapper.class.isAssignableFrom(Mapper.class)) {
					ParameterizedType genericType = (ParameterizedType) field.getGenericType();
					Class componentType = (Class) genericType.getActualTypeArguments()[0];

					field.setAccessible(true);
					field.set(target, world.getMapper(componentType));
				}
			}
		} catch (Exception e) {
			throw new RuntimeException("Error while setting component mappers", e);
		}
	}

}
*/
