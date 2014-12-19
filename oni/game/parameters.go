package game

type Parameters struct {
	//v max ReGeneration rate
	HP, MHP, HRG int // Hit Points
	MP, MMP, MRG int // Magic Points
	TP, MTP, TRG int // Tehnical Points

	ATK int // ATtacK power
	DEF int // DEFense power
}

func (p *Parameters) HPbar() (int, int) { return int(p.HP), int(p.MHP) }
func (p *Parameters) MPbar() (int, int) { return int(p.MP), int(p.MMP) }
func (p *Parameters) TPbar() (int, int) { return int(p.TP), int(p.MTP) }

// run it every second
func (p *Parameters) Regeneration() {
	p.RecoverHP(float64(p.HRG))
	p.RecoverMP(float64(p.MRG))
	p.RecoverTP(float64(p.TRG))
}

// for effects
func (p *Parameters) RecoverHP(v float64) {
	p.HP += int(v)
	if p.HP > p.MHP {
		p.HP = p.MHP
	}
	if p.HP < 0 {
		p.HP = 0
	}
}
func (p *Parameters) RecoverMP(v float64) {
	p.MP += int(v)
	if p.MP > p.MMP {
		p.MP = p.MMP
	}
	if p.MP < 0 {
		p.MP = 0
	}
}
func (p *Parameters) RecoverTP(v float64) {
	p.TP += int(v)
	if p.TP > p.MTP {
		p.TP = p.MTP
	}
	if p.TP < 0 {
		p.TP = 0
	}
}

// for features
func (p *Parameters) AddATK(v float64) { p.ATK += int(v) }
func (p *Parameters) AddDEF(v float64) { p.DEF += int(v) }
