package params

import (
	. "oniproject/oni/artemis"
	"time"
)

type ParamSystem struct {
	Rate time.Duration
	*BaseSystem
}

func NewParamSystem(rate time.Duration) (sys *ParamSystem) {
	sys = &ParamSystem{}
	sys.BaseSystem = NewBaseSystem(NewAspectFor((*Parameters)(nil)), sys)
	return
}
func (sys *ParamSystem) Regeneration(p *Parameters) bool {
	hp, mp, tp := p.HP, p.MP, p.TP
	p.RecoverHP(p.HRG)
	p.RecoverMP(p.MRG)
	p.RecoverTP(p.TRG)
	return hp != p.HP || mp != p.MP || tp != p.TP
}

func (sys *ParamSystem) ProcessEntities(entities []Entity) {
	for _, e := range entities {
		p := e.ComponentByType(PARAMETERS).(*Parameters)
		if sys.Regeneration(p) {
			e.ChangedInWorld()
		}
	}
}

func (sys *ParamSystem) CheckProcessing() bool { return true }
func (sys *ParamSystem) Inserted(e Entity)     {}
func (sys *ParamSystem) Removed(e Entity)      {}
