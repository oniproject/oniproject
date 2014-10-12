package game

import "testing"

func TestParameters(t *testing.T) {
	p := Parameters{
		HP: 5, MHP: 10, HRG: 1,
		MP: 5, MMP: 10, MRG: 1,
		TP: 5, MTP: 10, TRG: 1,
		ATK: 7,
		DEF: 8,
	}

	p.AddATK(3)
	if p.ATK != 10 {
		t.Error("fail AddATK")
	}
	p.AddDEF(2)
	if p.DEF != 10 {
		t.Error("fail AddATK")
	}

	p.Regeneration()
	p.Regeneration()
	p.Regeneration()
	p.Regeneration()
	if p.HP != 9 || p.MP != 9 || p.TP != 9 {
		t.Error("fail Regeneration")
	}

	p.Regeneration()
	if p.HP != 10 || p.MP != 10 || p.TP != 10 {
		t.Error("fail Regeneration")
	}

	p.Regeneration()
	if p.HP != 10 || p.MP != 10 || p.TP != 10 {
		t.Error("fail Regeneration")
	}

	p.RecoverHP(-999)
	p.RecoverMP(-999)
	p.RecoverTP(-999)
	if p.HP != 0 || p.MP != 0 || p.TP != 0 {
		t.Error("fail Recover")
	}
}
