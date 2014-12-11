package systems

import (
	. "oniproject/oni/artemis"
)

/*
  This system has an empty aspect so it processes no entities, but it still gets invoked.
  You can use this system if you need to execute some game logic and not have to concern
  yourself about aspects or entities.
*/
type VoidEntitySystem struct {
	*BaseSystem
}

func NewVoidEntitySystem() (sys *VoidEntitySystem) {
	sys = &VoidEntitySystem{}
	sys.BaseSystem = NewBaseSystem(NewAspect(), sys)
	return
}

func (sys *VoidEntitySystem) ProcessEntities(entities []Entity) {}
func (sys *VoidEntitySystem) CheckProcessing() bool             { return true }
func (sys *VoidEntitySystem) Inserted(e Entity)                 {}
func (sys *VoidEntitySystem) Removed(e Entity)                  {}
