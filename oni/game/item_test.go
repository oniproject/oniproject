package game

import (
	"./mock"
	gomock "code.google.com/p/gomock/gomock"
	"path"
	"testing"
)

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
}
