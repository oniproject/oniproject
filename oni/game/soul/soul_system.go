package soul

import (
	. "oniproject/oni/artemis"
	//"time"
)

type SoulSystem struct {
	*BaseSystem
}

func NewSoulSystem() (sys *SoulSystem) {
	sys = &SoulSystem{}
	sys.BaseSystem = NewBaseSystem(NewAspectFor((*SoulComponent)(nil)), sys)
	return
}

func (sys *SoulSystem) ProcessEntities(entities []Entity) {
	/*
		for _, e := range entities {
			p := e.ComponentByType(STATE).(*SoulComponent)
			if sys.check(p, now) {
				e.ChangedInWorld()
			}
		}
	*/
}

func (sys *SoulSystem) CheckProcessing() bool { return true }
func (sys *SoulSystem) Inserted(e Entity)     {}
func (sys *SoulSystem) Removed(e Entity)      {}
