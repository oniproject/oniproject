package mechanic

import (
	"./mock"
	gomock "code.google.com/p/gomock/gomock"
	"testing"
)

var test_armor = &Armor{
	Name:        "xxx",
	Price:       10,
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
