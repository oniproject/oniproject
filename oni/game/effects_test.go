package game

import (
	"./mock"
	gomock "code.google.com/p/gomock/gomock"
	"testing"
)

func TestEffects(t *testing.T) {
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()

	effects := EffectList{
		"hp 1",
		"vndfjk vndfjksl", // continue
		"mp 2",
		"tp 3",
		"state death",
		"rm-state death",
	}

	target := mock.NewMockEffectReceiver(mockCtrl)
	target.EXPECT().RecoverHP(1)
	target.EXPECT().RecoverMP(2)
	target.EXPECT().RecoverTP(3)
	target.EXPECT().AddState("death")
	target.EXPECT().RemoveState("death")

	effects.ApplyTo(target)
}
