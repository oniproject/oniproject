package mechanic

type Parameters struct {
	//v p    ex
	//  Max   ReGeneration rate
	HP, MHP, HRG int
	MP, MMP, MRG int
	TP, MTP, TRG int
}

// run it every second
func (p *Parameters) Regeneration() {
	p.RecoverHP(p.HRG)
	p.RecoverMP(p.MRG)
	p.RecoverTP(p.TRG)
}

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
