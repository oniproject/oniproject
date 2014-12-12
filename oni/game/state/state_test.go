package state_test

import (
	. "github.com/smartystreets/goconvey/convey"
	. "oniproject/oni/artemis"
	. "oniproject/oni/game/state"
	"testing"
	"time"
)

func Test_StateSystem(t *testing.T) {
	STATE_PATH = "../" + STATE_PATH

	world := NewWorld()
	sys := NewStateSystem()
	world.SetSystem(sys, false)

	e := world.CreateEntity()
	e.AddComponent(NewStateComponent())
	e.AddToWorld()

	state_name := "add_def"

	Convey("AddState", t, func() {
		Println(e.Components())
		sys.AddStateTo(e, state_name)
		states := sys.States(e)
		So(states, ShouldNotBeEmpty)
		So(states[state_name].Name, ShouldEqual, "Defence buff")
	})

	Convey("RemoveState", t, func() {
		sys.RemoveStateFrom(e, state_name)
		states := sys.States(e)
		So(states, ShouldBeEmpty)
	})

	Convey("AutoRemovalTiming", t, func() {
		sys.AddStateTo(e, state_name)
		s := e.ComponentByType(STATE).(*StateComponent)
		s.States[state_name] = time.Now().Add(-10 * time.Second)
		So(sys.States(e), ShouldNotBeEmpty)
		world.Process()
		So(sys.States(e), ShouldBeEmpty)
	})

	// TODO ApplyFeatures
}
