package artemis

import (
	"reflect"
)

/* High performance component retrieval from entities. Use this wherever you
need to retrieve components from entities often and fast.
*/
type ComponentMapper struct {
	t          reflect.Type
	components []Component
}

/* Returns a component mapper for this type of components.

param type the type of components this mapper uses.
param world the world that this component mapper should use.
return a new mapper.
*/
func newComponentMapper(t *ComponentType, world *World) *ComponentMapper {
	return &ComponentMapper{
		components: world.ComponentManager().TypedComponents(t),
	}
}

/**
 * Fast but unsafe retrieval of a component for this entity.
 * No bounding checks, so this could throw an ArrayIndexOutOfBoundsExeption,
 * however in most scenarios you already know the entity possesses this component.
 *
 * @param e the entity that should possess the component
 * @return the instance of the component
 */
func (mapper *ComponentMapper) Get(e Entity) (c Component) {
	defer func() {
		if err := recover(); err != nil {
			c = nil
		}
	}()
	return mapper.components[e.Id()]
}

/**
 * Checks if the entity has this type of component.
 * @param e the entity to check
 * @return true if the entity has this component type, false if it doesn't.
 */
/*func (mapper *ComponentMapper) GetSafe(e Entity) Component {
	if components.isIndexWithinBounds(e.Id()) {
		return mapper.components.Get(e.Id())
	}
	return nil
}*/

/**
 * Checks if the entity has this type of component.
 * @param e the entity to check
 * @return true if the entity has this component type, false if it doesn't.
 */
func (mapper *ComponentMapper) Has(e Entity) (has bool) {
	return mapper.Get(e) != nil
}
