package params

import (
	. "oniproject/oni/artemis"
)

var PARAMETERS = GetIndexFor((*Parameters)(nil))

type Parameters struct {
	//v max ReGeneration rate
	HP, MHP, HRG int // Hit Points
	MP, MMP, MRG int // Magic Points
	TP, MTP, TRG int // Tehnical Points

	ATK int // ATtacK power
	DEF int // DEFense power
}

func (p *Parameters) Name() string { return "params" }

func (p *Parameters) HPbar() (int, int) { return p.HP, p.MHP }
func (p *Parameters) MPbar() (int, int) { return p.MP, p.MMP }
func (p *Parameters) TPbar() (int, int) { return p.TP, p.MTP }

// run it every second
func (p *Parameters) Regeneration() {
	panic("refactoring")
	p.RecoverHP(p.HRG)
	p.RecoverMP(p.MRG)
	p.RecoverTP(p.TRG)
}

// for effects
func (p *Parameters) RecoverHP(v int) {
	p.HP += v
	if p.HP > p.MHP {
		p.HP = p.MHP
	}
	if p.HP < 0 {
		p.HP = 0
	}
}
func (p *Parameters) RecoverMP(v int) {
	p.MP += v
	if p.MP > p.MMP {
		p.MP = p.MMP
	}
	if p.MP < 0 {
		p.MP = 0
	}
}
func (p *Parameters) RecoverTP(v int) {
	p.TP += v
	if p.TP > p.MTP {
		p.TP = p.MTP
	}
	if p.TP < 0 {
		p.TP = 0
	}
}

// for features
func (p *Parameters) AddATK(v int) { p.ATK += v }
func (p *Parameters) AddDEF(v int) { p.DEF += v }

func NewParameters() *Parameters {
	return &Parameters{}
}
