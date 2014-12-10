package managers

/*
import java.util.HashMap;
import java.util.Map;

import com.artemis.Entity;
import com.artemis.Manager;
import com.artemis.utils.Bag;
import com.artemis.utils.ImmutableBag;
*/

/* You may sometimes want to specify to which player an entity belongs to.

An entity can only belong to a single player at a time.
*/
type PlayerManager struct {
	playerByEntity   map[*Entity]string
	entitiesByPlayer map[string][]*Entity
}

func NewPlayerManager() *PlayerManager {
	return &PlayerManager{
		playerByEntity:   make(map[*Entity]string),
		entitiesByPlayer: make(map[string][]*Entity),
	}
}

func (m *PlayerManager) Added(e *Entity)       {}
func (m *PlayerManager) Changed(e *Entity)     {}
func (m *PlayerManager) Deleted(e *Entity)     { m.RemoveFromPlayer(e) }
func (m *PlayerManager) Enabled(e *Entity)     {}
func (m *PlayerManager) Disabled(e *Entity)    {}
func (m *PlayerManager) SetWorld(world *World) {}
func (m *PlayerManager) Initialize()           {}

func (m *PlayerManager) SetPlayer(e *Entity, player string) {
	m.playerByEntity[e] = player
	if entities, ok := m.entitiesByPlayer[player]; !ok {
		m.entitiesByPlayer[player] = []*Entity{e}
	} else {
		m.entitiesByPlayer[player] = append(entities, e)
	}
}

func (m *PlayerManager) EntitiesOfPlayer(player string) []*Entity { return m.entitiesByPlayer[player] }
func (m *PlayerManager) PlayerByEntity(e *Entity) string          { return m.playerByEntity[e] }

func (m *PlayerManager) RemoveFromPlayer(e *Entity) {
	if player, ok := m.playerByEntity[e]; ok {
		if entities, ok := m.entitiesByPlayer[player]; ok {
			for i, other := range entities {
				if other == e {
					entities = append(entities[:i], entities[i+1:]...)
					break
				}
			}
			if len(entities) == 0 {
				delete(m.entitiesByPlayer, player)
				delete(m.playerByEntity, e)
			} else {
				m.entitiesByPlayer[player] = entities
			}
		}
	}
}
