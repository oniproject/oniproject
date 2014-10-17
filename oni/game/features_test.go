package game

import (
	"./mock"
	gomock "code.google.com/p/gomock/gomock"
	"testing"
)

func TestFeatures(t *testing.T) {
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()

	features := FeatureList{
		"atk 1",
		"vndfjk vndfjksl", // continue
		"def 2",
		"skill heal",
		"rm-skill heal",
	}

	target := mock.NewMockFeatureReceiver(mockCtrl)
	target.EXPECT().AddATK(1)
	target.EXPECT().AddDEF(2)
	target.EXPECT().AddSkill("heal")
	target.EXPECT().SealSkill("heal")

	features.Run(target)
}
