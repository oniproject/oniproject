package game

import (
	"./mock"
	gomock "code.google.com/p/gomock/gomock"
	"path"
	"testing"
)

const item_path = "../../data/items"

var test_armor = &Item{
	Name:        "xxx",
	EquipTypeId: 1, // heavy armor ?
	SlotTypeId:  2, // body ?
	features:    FeatureList{&AddDEF{10}},
}

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
		item, err := LoadItemYaml(path.Join(item_path, fname))
		if err != nil {
			t.Error(err)
		} else {
			t.Logf("type:'%s'\tslot:'%s'\t%v", item.Type, item.Slot, item)
		}
	}
}
