package items_test

import (
	. "github.com/smartystreets/goconvey/convey"
	. "oniproject/oni/artemis"
	. "oniproject/oni/game/items"
	"testing"
)

var items = []string{
	"bow", "hauberk", "hp-potion", "knife", "small-shield", "staff",
}

func Test_InventorySystem(t *testing.T) {
	ITEM_PATH = "../" + ITEM_PATH

	world := NewWorld()
	sys := NewInventorySystem()
	world.SetSystem(sys, true)

	slot := "body"
	name := "hauberk"

	e := world.CreateEntity()
	c := NewInventoryComponent(2, 2, []string{"left", "rigth", slot})
	e.AddComponent(c)
	e.AddToWorld()

	Convey("AddItems", t, func() {
		item, err := sys.AddItem(e, name, 0, 0)
		So(err, ShouldBeNil)
		So(c.Inventory, ShouldResemble, [][]string{
			{name, ""},
			{"", ""},
		})
		Println(item)
	})

	Convey("EquipItem", t, func() {
		item, err := sys.EquipItem(e, 0, 0)
		So(err, ShouldBeNil)
		So(c.Inventory, ShouldResemble, [][]string{
			{"", ""},
			{"", ""},
		})
		So(c.Equip, ShouldResemble, map[string]string{
			slot:    name,
			"left":  "",
			"rigth": "",
		})
		Println(item)
	})

	Convey("UnequipItem", t, func() {
		item, err := sys.UnequipItem(e, "body")
		So(err, ShouldBeNil)
		So(c.Inventory, ShouldResemble, [][]string{
			{name, ""},
			{"", ""},
		})
		So(c.Equip, ShouldResemble, map[string]string{
			slot:    "",
			"left":  "",
			"rigth": "",
		})
		Println(item)
	})

	Convey("RemoveItem", t, func() {
		item, err := sys.RemoveItem(e, 0, 0)
		So(err, ShouldBeNil)
		So(c.Inventory, ShouldResemble, [][]string{
			{"", ""},
			{"", ""},
		})
		Println(item)
	})

	// TODO ApplyFeatures
}
