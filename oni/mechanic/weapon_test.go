package mechanic

import (
	"./mock"
	gomock "code.google.com/p/gomock/gomock"
	"testing"
)

var test_weapon = &Armor{
	Name:        "xxx",
	Price:       10,
	EquipTypeId: 1, // heavy armor ?
	SlotTypeId:  2, // body ?
	features:    FeatureList{&AddATK{10}},
}

func TestWeaponApplyFeatures(t *testing.T) {
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()

	avatar := mock.NewMockFeatureReceiver(mockCtrl)
	avatar.EXPECT().AddATK(10)

	test_weapon.ApplyFeatures(avatar)
}
