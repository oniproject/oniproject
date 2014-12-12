package soul_test

import (
	. "github.com/smartystreets/goconvey/convey"
	. "oniproject/oni/artemis"
	. "oniproject/oni/game/soul"
	"testing"
)

func Test_SoulSystem(t *testing.T) {
	world := NewWorld()
	sys := NewSoulSystem()
	world.SetSystem(sys, false)

	e := world.CreateEntity()
	e.AddComponent(NewSoulComponent())
	e.AddToWorld()

	SkipConvey("ok", t, func() {
	})
}
