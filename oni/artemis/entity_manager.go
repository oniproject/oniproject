package artemis

import (
	"github.com/willf/bitset"
)

type EntityManager struct {
	entities map[uint]Entity
	disabled *bitset.BitSet

	active  int
	added   int64
	created int64
	deleted int64

	identifierPool

	BaseWorldSaver
	BaseInitializer
}

func NewEntityManager() *EntityManager {
	return &EntityManager{
		disabled: bitset.New(0),
		entities: make(map[uint]Entity),
	}
}

func (m *EntityManager) CreateEntityInstance() (e Entity) {
	e = newEntity(m.world, m.checkOut())
	m.created++
	return
}

func (m *EntityManager) Added(e Entity) {
	m.active++
	m.added++
	m.entities[e.Id()] = e
}
func (m *EntityManager) Changed(e Entity) {}
func (m *EntityManager) Deleted(e Entity) {
	delete(m.entities, e.Id())

	m.disabled.Clear(e.Id())

	m.checkIn(e.Id())

	m.active--
	m.deleted++

}
func (m *EntityManager) Enabled(e Entity) {
	m.disabled.Clear(e.Id())
}
func (m *EntityManager) Disabled(e Entity) {
	m.disabled.Set(e.Id())
}

/**
 * Check if this entity is active.
 * Active means the entity is being actively processed.
 *
 * @param entityId
 * @return true if active, false if not.
 */
func (m *EntityManager) IsActive(entityId uint) (ok bool) {
	_, ok = m.entities[entityId]
	return
}

/**
 * Check if the specified entityId is enabled.
 *
 * @param entityId
 * @return true if the entity is enabled, false if it is disabled.
 */
func (m *EntityManager) IsEnabled(entityId uint) bool {
	return !m.disabled.Test(entityId)
}

// Get a entity with this id.
func (m *EntityManager) EntityById(entityId uint) Entity {
	return m.entities[entityId]
}

// Get how many entities are active in this world.
func (m *EntityManager) ActiveEntityCount() int { return m.active }

/* Get how many entities have been created in the world since start.
 * Note: A created entity may not have been added to the world, thus
 * created count is always equal or larger than added count.
 * @return how many entities have been created since start.
 */
func (m *EntityManager) TotalCreated() int64 { return m.created }

// Get how many entities have been added to the world since start.
func (m *EntityManager) TotalAdded() int64 { return m.added }

// Get how many entities have been deleted from the world since start.
func (m *EntityManager) TotalDeleted() int64 { return m.deleted }

// Used only internally to generate distinct ids for entities and reuse them.
type identifierPool struct {
	ids             []uint
	nextAvailableId uint
}

func (pool *identifierPool) checkIn(id uint) {
	pool.ids = append(pool.ids, id)
}
func (pool *identifierPool) checkOut() (id uint) {
	if len(pool.ids) > 0 {
		id = pool.ids[len(pool.ids)-1]
		pool.ids = pool.ids[:len(pool.ids)-1]
		return
	}

	id = pool.nextAvailableId
	pool.nextAvailableId++
	return
}
