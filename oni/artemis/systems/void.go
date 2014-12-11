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

func NewVoidEntitySystem() *VoidEntitySystem {
	return &VoidEntitySystem{
		BaseSystem: NewBaseSystem(NewAspect()),
	}
}

func (sys *VoidEntitySystem) ProcessEntities(entities []*Entity) {
	sys.ProcessSystem()
}

func (sys *VoidEntitySystem) ProcessSystem()        {}
func (sys *VoidEntitySystem) CheckProcessing() bool { return true }
