package artemis_test

import (
	gomock "code.google.com/p/gomock/gomock"
	"encoding/json"
	. "github.com/smartystreets/goconvey/convey"
	. "oniproject/oni/artemis"
	"testing"
)

var (
	NAME     = GetIndexFor((*NameComponent)(nil))
	POSITION = GetIndexFor((*PositionComponent)(nil))
)

type NameComponent string

func (c *NameComponent) Name() string { return "name" }

type PositionComponent struct {
	X        float64
	Y        float64
	Rotation float64
}

func (c *PositionComponent) Name() string { return "position" }
func (c *PositionComponent) MarshalJSON() (dst []byte, err error) {
	src := []float64{c.X, c.Y, c.Rotation}
	return json.Marshal(src)
}
func (c *PositionComponent) UnmarshalJSON(src []byte) (err error) {
	dst := []float64{}

	err = json.Unmarshal(src, &dst)
	if err != nil {
		return
	}

	c.X = dst[0]
	c.Y = dst[1]
	c.Rotation = dst[2]

	return
}

func Test_World(t *testing.T) {
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()
	target := NewMockSystem(mockCtrl)

	world := NewWorld()

	test_pos := &PositionComponent{1, 2, 3}
	_test_name := NameComponent("qwerty")
	test_name := &_test_name

	avatar := world.CreateEntity()
	avatar.AddComponent(test_name)
	avatar.AddComponent(test_pos)

	Convey("Avatar unmarshal", t, func() {
		cs := avatar.Components()
		So(cs, ShouldNotBeEmpty)
		So(len(cs), ShouldEqual, 2)
		for _, c := range cs {
			switch c := c.(type) {
			case *PositionComponent:
				So(c, ShouldResemble, test_pos)
			case *NameComponent:
				So(c, ShouldResemble, test_name)
			}
		}

		Println()
		Println("systems", world.Systems())
		Println("managers", world.Managers())

		Println("c bits", avatar.ComponentBits().DumpAsBits())
		Println("s bits", avatar.SystemBits().DumpAsBits())
	})

	Convey("Add System", t, func() {
		target.EXPECT().SetWorld(world)
		target.EXPECT().SetPassive(false)
		world.SetSystem(target, false)
	})

	Convey("Initialize", t, func() {
		target.EXPECT().Initialize()
		world.Initialize()
	})

	Convey("Process", t, func() {
		avatar.AddToWorld()
		avatar.ChangedInWorld()
		avatar.Disable()
		avatar.Enable()
		avatar.DeleteFromWorld()

		gomock.InOrder(
			target.EXPECT().Added(avatar),
			target.EXPECT().Changed(avatar),
			target.EXPECT().Disabled(avatar),
			target.EXPECT().Enabled(avatar),
			target.EXPECT().Deleted(avatar),
			target.EXPECT().IsPassive(),
			target.EXPECT().Process(),
		)

		world.Process()
	})
}
