package artemis

type ComponentManager struct {
	componentsByType map[uint]map[uint]Component

	deleted []Entity

	BaseEntityObserver
	BaseWorldSaver
	BaseInitializer
}

func NewComponentManager() *ComponentManager {
	return &ComponentManager{
		componentsByType: make(map[uint]map[uint]Component),
	}
}

func (cm *ComponentManager) removeComponentsOfEntity(e Entity) {
	componentBits := e.ComponentBits()
	for i, ok := componentBits.NextSet(0); ok; i, ok = componentBits.NextSet(i + 1) {
		delete(cm.componentsByType[i], e.Id())
	}
	componentBits.ClearAll()
}

func (cm *ComponentManager) AddComponent(e Entity, component Component) {
	t := GetIndexFor(component)
	//FIXME cm.componentsByType.EnsureCapacity(t.Index())

	components, ok := cm.componentsByType[t]
	if !ok {
		components = make(map[uint]Component)
		cm.componentsByType[t] = components
	}
	components[e.Id()] = component

	e.ComponentBits().Set(t)
}

func (cm *ComponentManager) RemoveComponent(e Entity, t uint) {
	if e.ComponentBits().Test(t) {
		delete(cm.componentsByType[t], e.Id())
		e.ComponentBits().Clear(t)
	}
}

func (cm *ComponentManager) TypedComponents(t uint) (ret []Component) {
	components, ok := cm.componentsByType[t]
	if !ok {
		components = make(map[uint]Component)
		cm.componentsByType[t] = components
	}
	for _, c := range components {
		ret = append(ret, c)
	}
	return
}

func (cm *ComponentManager) ComponentByType(e Entity, t uint) Component {
	components, ok := cm.componentsByType[t]
	if ok {
		return components[e.Id()]
	}
	return nil
}

func (cm *ComponentManager) ComponentsFor(e Entity) (fill []Component) {
	componentBits := e.ComponentBits()

	for i, ok := componentBits.NextSet(0); ok; i, ok = componentBits.NextSet(i + 1) {
		fill = append(fill, cm.componentsByType[i][e.Id()])
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
