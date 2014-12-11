package game

import (
	//"github.com/oniproject/geom"
	. "oniproject/oni/artemis"
	//"oniproject/oni/utils"
	"time"
)

type Replication struct {
	changed []Entity
	*BaseSystem
	tick uint
}

func NewReplication() (sys *Replication) {
	sys = &Replication{}
	sys.BaseSystem = NewBaseSystem(NewAspectFor((*Connection)(nil)), sys)
	return
}

func (sys *Replication) CheckProcessing() bool { return true }
func (sys *Replication) Inserted(e Entity) {
	// TODO send friend message
}
func (sys *Replication) Removed(e Entity) {
	// TODO send friend message
	// TODO save
}

func (sys *Replication) Added(e Entity) {
	sys.BaseSystem.Added(e)
	sys.Changed(e)
}
func (sys *Replication) Deleted(e Entity) {
	sys.BaseSystem.Deleted(e)
	sys.Changed(e)
}

func (sys *Replication) Changed(e Entity) {
	sys.changed = append(sys.changed, e)
}

func (sys *Replication) ProcessEntities(entities []Entity) {
	for _, avatar := range entities {
		pos := avatar.ComponentByType(POSITION).(*PositionComponent)

		msg := &ReplicaMsg{sys.tick, []*GameObjectState{}}

		for _, obj := range sys.changed {
			cpos := obj.ComponentByType(POSITION).(*PositionComponent)
			if sys.test(pos, cpos) {
				// HPbar
				hp, mhp := 0, 0
				params := obj.ComponentByType(PARAMETERS).(*Parameters)
				if params != nil {
					hp, mhp = params.HPbar()
				}

				// lag
				lag := time.Duration(0)
				connection := obj.ComponentByType(CONNECTION).(*Connection)
				if connection != nil {
					lag = connection.Lag()
				}

				state := &GameObjectState{
					STATE_IDLE, obj.UUID(), lag,
					cpos.Position(), cpos.Velocity(),
					hp, mhp}

				if cpos.Velocity().X != 0 || cpos.Velocity().Y != 0 {
					state.Type = STATE_MOVE
				}

				msg.States = append(msg.States, state)
			}
		}

		connection := avatar.ComponentByType(CONNECTION).(*Connection)
		connection.Send(msg)
	}
	sys.changed = nil
	sys.tick++
}

func (sys *Replication) test(one, two *PositionComponent) bool {
	d := one.Position().DistanceFrom(two.Position())
	return d <= ReplicRange
}
