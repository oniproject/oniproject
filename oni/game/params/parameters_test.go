package params_test

import (
	. "github.com/smartystreets/goconvey/convey"
	. "oniproject/oni/artemis"
	. "oniproject/oni/game/params"
	"testing"
)

func Test_ParametersSystem(t *testing.T) {
	world := NewWorld()
	sys := NewParamSystem(10)
	world.SetSystem(sys, false)

	e := world.CreateEntity()
	p := &Parameters{
		HP: 5, MHP: 10, HRG: 1,
		MP: 5, MMP: 10, MRG: 1,
		TP: 5, MTP: 10, TRG: 1,
		ATK: 7,
		DEF: 8,
	}
	e.AddComponent(p)
	e.AddToWorld()

	Convey("ATK & DEF", t, func() {
		p.AddATK(3)
		p.AddDEF(2)
		So(p.ATK, ShouldEqual, 10)
		So(p.DEF, ShouldEqual, 10)
	})

	Convey("Regeneration", t, func() {
		world.Process()
		world.Process()
		world.Process()
		world.Process()
		So(p.HP, ShouldEqual, 9)
		So(p.MP, ShouldEqual, 9)
		So(p.TP, ShouldEqual, 9)
	})

	Convey("Regeneration MAX", t, func() {
		world.Process()
		So(p.HP, ShouldEqual, 10)
		So(p.MP, ShouldEqual, 10)
		So(p.TP, ShouldEqual, 10)
		world.Process()
		So(p.HP, ShouldEqual, 10)
		So(p.MP, ShouldEqual, 10)
		So(p.TP, ShouldEqual, 10)
	})

	Convey("Recover MIN", t, func() {
		p.RecoverHP(-999)
		p.RecoverMP(-999)
		p.RecoverTP(-999)
		So(p.HP, ShouldEqual, 0)
		So(p.MP, ShouldEqual, 0)
		So(p.TP, ShouldEqual, 0)
	})

	Convey("bars", t, func() {
		hp, mhp := p.HPbar()
		mp, mmp := p.MPbar()
		tp, mtp := p.TPbar()
		So(mhp-hp, ShouldEqual, 10)
		So(mmp-mp, ShouldEqual, 10)
		So(mtp-tp, ShouldEqual, 10)
	})
}
