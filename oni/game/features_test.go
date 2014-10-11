package game

import (
	"./mock"
	gomock "code.google.com/p/gomock/gomock"
	"testing"
)

func TestFeatures(t *testing.T) {
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()

	features := ParseFeatureList([]string{
		"atk 1",
		"vndfjk vndfjksl", // continue
		"def 2",
		"skill 3",
		"rm-skill 4",
	})

	target := mock.NewMockFeatureReceiver(mockCtrl)
	target.EXPECT().AddATK(1)
	target.EXPECT().AddDEF(2)
	target.EXPECT().AddSkill(3)
	target.EXPECT().SealSkill(4)

	features.Run(target)
}
