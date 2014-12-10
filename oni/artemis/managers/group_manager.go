package managers

import (
	. "oniproject/oni/artemis"
)

/* If you need to group your entities together, e.g. tanks going into "units" group or explosions into "effects",
then use this manager. You must retrieve it using world instance.

A entity can be assigned to more than one group.
*/
type GroupManager struct {
	entitiesByGroup map[string][]*Entity
	groupsByEntity  map[*Entity][]string
}

func NewGroupManager() *GroupManager {
	return &GroupManager{
		entitiesByGroup: make(map[string][]*Entity),
		groupsByEntity:  make(map[*Entity][]string),
	}
}

func (m *GroupManager) Added(e *Entity)       {}
func (m *GroupManager) Changed(e *Entity)     {}
func (m *GroupManager) Deleted(e *Entity)     { m.RemoveFromAllGroups(e) }
func (m *GroupManager) Enabled(e *Entity)     {}
func (m *GroupManager) Disabled(e *Entity)    {}
func (m *GroupManager) SetWorld(world *World) {}
func (m *GroupManager) Initialize()           {}

/* Set the group of the entity.

group - group to add the entity into.
e - entity to add into the group.
*/
func (m *GroupManager) Add(e *Entity, group string) {
	if entities, ok := m.entitiesByGroup[group]; ok {
		m.entitiesByGroup[group] = append(entities, e)
	} else {
		m.entitiesByGroup[group] = []*Entity{e}
	}

	if groups, ok := m.groupsByEntity[e]; ok {
		m.groupsByEntity[e] = append(groups, group)
	} else {
		m.groupsByEntity[e] = []string{group}
	}
}

// Remove the entity from the specified group.
func (m *GroupManager) Remove(e *Entity, group string) {
	if entities, ok := m.entitiesByGroup[group]; ok {
		for i, other := range entities {
			if other == e {
				m.entitiesByGroup[group] = append(entities[:i], entities[i+1:]...)
				break
			}
		}
	}

	if groups, ok := m.groupsByEntity[e]; ok {
		for i, other := range groups {
			if other == group {
				m.groupsByEntity[e] = append(groups[:i], groups[i+1:]...)
				break
			}
		}
	}
}

func (m *GroupManager) RemoveFromAllGroups(e *Entity) {
	groups, ok := m.groupsByEntity[e]
	if ok {
		for _, group := range groups {
			entities, ok := m.entitiesByGroup[group]
			if ok {
				for i, other := range entities {
					if other == e {
						entities = append(entities[:i], entities[i+1:]...)
					}
				}
			}
			m.entitiesByGroup[group] = entities
		}
		m.groupsByEntity[e] = []string{}
	}
}

/* Get all entities that belong to the provided group.
group name of the group.
return read-only bag of entities belonging to the group.
*/
func (m *GroupManager) EntitiesByGroup(group string) []*Entity {
	entities, ok := m.entitiesByGroup[group]
	if !ok {
		entities = []*Entity{}
		m.entitiesByGroup[group] = entities
	}
	return entities
}

// return the groups the entity belongs to, null if none.
func (m *GroupManager) GroupsByEntity(e *Entity) []string {
	return m.groupsByEntity[e]
}

/* Checks if the entity belongs to any group.

e - the entity to check.
return true if it is in any group, false if none.
*/
func (m *GroupManager) IsInAnyGroup(e *Entity) bool {
	return len(m.GroupsByEntity(e)) != 0
}

/* Check if the entity is in the supplied group.

group - the group to check in.
e - the entity to check for.
return true if the entity is in the supplied group, false if not.
*/
func (m *GroupManager) IsInGroup(e *Entity, group string) bool {
	if group != "" {
		for _, g := range m.groupsByEntity[e] {
			if g == group {
				return true
			}
		}
	}
	return false
}
