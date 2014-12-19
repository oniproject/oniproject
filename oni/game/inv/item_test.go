package inv_test

import (
	. "github.com/smartystreets/goconvey/convey"
	. "oniproject/oni/game/inv"
	//"reflect"
	"testing"
	//"time"
)

var items = []string{
	"bow", "hauberk", "hp-potion", "knife", "small-shield", "staff",
}

func Test_Inventory(t *testing.T) {
	ITEM_PATH = "../" + ITEM_PATH

	WipeCache()

	hauberk := "hauberk"
	bow := "bow"
	inv := NewInventoryComponent(2, 2, []string{"left", "right", "body"})

	var err error

	Convey("AddItem", t, func() {
		err = inv.AddItem(hauberk, 0, 0)
		So(err, ShouldBeNil)
		So(inv.Inventory, ShouldResemble, [][]string{
			{hauberk, ""},
			{"", ""},
		})

		err = inv.AddItem(hauberk, 666, 666)
		So(err, ShouldEqual, InventoryBadPlace)

		err = inv.AddItem(bow, 0, 0)
		So(err, ShouldBeNil)
		So(inv.Inventory, ShouldResemble, [][]string{
			{bow, hauberk},
			{"", ""},
		})
		// TODO InventoryFull
	})

	Convey("RemoveItem", t, func() {
		// remove hauberk
		inv.RemoveItem(0, 0)
		So(inv.Inventory, ShouldResemble, [][]string{
			{"", hauberk},
			{"", ""},
		})
		// remove bow
		inv.RemoveItem(1, 0)
		So(inv.Inventory, ShouldResemble, [][]string{
			{"", ""},
			{"", ""},
		})
	})

	Convey("EquipItem", t, func() {
		// equip bow
		err = inv.AddItem(bow, 0, 0)
		err = inv.EquipItem(0, 0)
		So(err, ShouldBeNil)
		So(inv.Inventory, ShouldResemble, [][]string{
			{"", ""},
			{"", ""},
		})
		So(inv.Equip["left"], ShouldResemble, &Slot{"", true})
		So(inv.Equip["right"], ShouldResemble, &Slot{"bow", false})
	})

	Convey("UnequipItem", t, func() {
		err = inv.UnequipItem("right")
		So(err, ShouldBeNil)
		So(inv.Inventory, ShouldResemble, [][]string{
			{"bow", ""},
			{"", ""},
		})
		So(inv.Equip, ShouldResemble, map[string]*Slot{
			"body":  {},
			"left":  {},
			"right": {},
		})
	})

	// TODO ApplyFeatures
}

//"./mock"
//gomock "code.google.com/p/gomock/gomock"
//"path"
//"testing"

/*
var test_armor, _ = LoadItemYaml(path.Join(ITEM_PATH, "hauberk.yml"))

func TestArmorApplyFeatures(t *testing.T) {
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()

	avatar := mock.NewMockFeatureReceiver(mockCtrl)
	avatar.EXPECT().AddDEF(10)

	test_armor.ApplyFeatures(avatar)
}

var files = []string{
	"bow.yml", "hauberk.yml", "hp-potion.yml", "knife.yml", "small-shield.yml", "staff.yml",
}

func TestLoadItem(t *testing.T) {
	for _, fname := range files {
		item, err := LoadItemYaml(path.Join(ITEM_PATH, fname))
		if err != nil {
			t.Error(err)
		} else {
			t.Logf("type:'%s'\tslot:'%s'\t%v", item.Type, item.Slot1+" "+item.Slot2, item)
		}
	}
}*/
