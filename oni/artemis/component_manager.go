package artemis

import (
	log "github.com/Sirupsen/logrus"
	"reflect"
)

type ComponentManager struct {
	componentsByType map[int]map[int]Component

	registredCompontents map[string]reflect.Type

	deleted []Entity

	BaseEntityObserver
	BaseWorldSaver
	BaseInitializer
}

func NewComponentManager() *ComponentManager {
	return &ComponentManager{
		registredCompontents: make(map[string]reflect.Type),
		componentsByType:     make(map[int]map[int]Component),
	}
}

func (cm *ComponentManager) createComponentByName(name string) Component {
	t, ok := cm.registredCompontents[name]
	if !ok {
		return nil
	}
	return reflect.New(t.Elem()).Interface().(Component)
}

func (cm *ComponentManager) register(name string, t reflect.Type) {
	ct := reflect.TypeOf((*Component)(nil)).Elem()
	if !t.Implements(ct) {
		log.Panic("Registred Component is NOT Component", name, t)
	}
	cm.registredCompontents[name] = t
}

func (cm *ComponentManager) unregister(name string) {
	delete(cm.registredCompontents, name)
}

func (cm *ComponentManager) removeComponentsOfEntity(e Entity) {
	componentBits := e.ComponentBits()
	for i, ok := componentBits.NextSet(0); ok; i, ok = componentBits.NextSet(i + 1) {
		delete(cm.componentsByType[int(i)], e.Id())
	}
	componentBits.ClearAll()
}

func (cm *ComponentManager) AddComponent(e Entity, component Component) {
	t := getTypeFor(component)
	//FIXME cm.componentsByType.EnsureCapacity(t.Index())

	components, ok := cm.componentsByType[t.Index()]
	if !ok {
		components = make(map[int]Component)
		cm.componentsByType[t.Index()] = components
	}
	components[e.Id()] = component

	e.ComponentBits().Set(uint(t.Index()))
}

func (cm *ComponentManager) RemoveComponent(e Entity, t *ComponentType) {
	if e.ComponentBits().Test(uint(t.Index())) {
		delete(cm.componentsByType[t.Index()], e.Id())
		e.ComponentBits().Clear(uint(t.Index()))
	}
}

func (cm *ComponentManager) TypedComponents(t *ComponentType) (ret []Component) {
	components, ok := cm.componentsByType[t.Index()]
	if !ok {
		components = make(map[int]Component)
		cm.componentsByType[t.Index()] = components
	}
	for _, c := range components {
		ret = append(ret, c)
	}
	return
}

func (cm *ComponentManager) ComponentByType(e Entity, t *ComponentType) Component {
	components, ok := cm.componentsByType[t.Index()]
	if ok {
		return components[e.Id()]
	}
	return nil
}

func (cm *ComponentManager) ComponentsFor(e Entity) (fill []Component) {
	componentBits := e.ComponentBits()

	for i, ok := componentBits.NextSet(0); ok; i, ok = componentBits.NextSet(i + 1) {
		fill = append(fill, cm.componentsByType[int(i)][e.Id()])
	}

	return
}
func (cm *ComponentManager) Delete(e Entity) {
	cm.deleted = append(cm.deleted, e)
}
func (cm *ComponentManager) Clean() {
	for _, e := range cm.deleted {
		cm.removeComponentsOfEntity(e)
	}
	cm.deleted = []Entity{}
}
