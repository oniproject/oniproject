package mechanic

import (
	"./mock"
	gomock "code.google.com/p/gomock/gomock"
	"testing"
	"time"
)

var healing = &Skill{
	Name:      "Healing",
	Target:    TARGET_SAME_RACE,
	CastDealy: 10 * time.Second,
	onTarget:  EffectList{&RecoverHP{Count: 50}},
	onCaster:  EffectList{&RecoverMP{Count: -10}},
}

func TestHealing(t *testing.T) {
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()

	target := mock.NewMockSkillTarget(mockCtrl)
	target.EXPECT().Race().Return(4).AnyTimes()
	target.EXPECT().RecoverHP(50)
	caster := mock.NewMockSkillTarget(mockCtrl)
	caster.EXPECT().Race().Return(4).AnyTimes()
	caster.EXPECT().RecoverMP(-10)

	err := healing.Cast(caster, target, time.Now().Add(-30*time.Second))
	if err != nil {
		t.Error(err)
	}
}

func TestHealingCooldown(t *testing.T) {
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()

	target := mock.NewMockSkillTarget(mockCtrl)
	target.EXPECT().Race().Return(4).AnyTimes()
	caster := mock.NewMockSkillTarget(mockCtrl)
	caster.EXPECT().Race().Return(4).AnyTimes()

	err := healing.Cast(caster, target, time.Now())
	if err == nil {
		t.Fail()
	}
	t.Log(err)
}
