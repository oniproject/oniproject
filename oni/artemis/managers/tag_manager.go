package managers

import (
	. "oniproject/oni/artemis"
)

/* If you need to tag any entity, use this. A typical usage would be to tag
   entities such as "PLAYER", "BOSS" or something that is very unique.
*/
type TagManager struct {
	entitiesByTag map[string]*Entity
	tagsByEntity  map[*Entity]string
}

func NewTagManager() *TagManager {
	return &TagManager{
		entitiesByTag: make(map[string]*Entity),
		tagsByEntity:  make(map[*Entity]string),
	}
}

func (m *TagManager) Added(e *Entity)   {}
func (m *TagManager) Changed(e *Entity) {}
func (m *TagManager) Deleted(e *Entity) {
	removedTag, ok := m.tagsByEntity[e]
	if ok {
		delete(m.tagsByEntity, e)
		delete(m.entitiesByTag, removedTag)
	}
}
func (m *TagManager) Enabled(e *Entity)     {}
func (m *TagManager) Disabled(e *Entity)    {}
func (m *TagManager) SetWorld(world *World) {}
func (m *TagManager) Initialize()           {}

func (m *TagManager) Register(tag string, e *Entity) {
	m.entitiesByTag[tag] = e
	m.tagsByEntity[e] = tag
}
func (m *TagManager) Unregister(tag string) {
	e, ok := m.entitiesByTag[tag]
	if ok {
		delete(m.entitiesByTag, tag)
		delete(m.tagsByEntity, e)
	}
}

func (m *TagManager) IsRegister(tag string) bool {
	_, ok := m.entitiesByTag[tag]
	return ok
}
func (m *TagManager) EntityByTag(tag string) *Entity { return m.entitiesByTag[tag] }
func (m *TagManager) RegisteredTags() (tags []string) {
	for _, tag := range m.tagsByEntity {
		tags = append(tags, tag)
	}
	return
}
