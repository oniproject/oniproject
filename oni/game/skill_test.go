package game

/*
import (
	"./mock"
	gomock "code.google.com/p/gomock/gomock"
	"path"
	"testing"
	"time"
)

var healing, _ = LoadSkillYaml(path.Join(SKILL_PATH, "healing.yml"))

func TestHealing(t *testing.T) {
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()

	target := mock.NewMockSkillTarget(mockCtrl)
	target.EXPECT().Race().Return(4).AnyTimes()
	target.EXPECT().RecoverHP(50)

	err := healing.Cast(target, time.Now().Add(-30*time.Second))
	if err != nil {
		t.Error(err)
	}
}

func TestHealingCooldown(t *testing.T) {
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()

	target := mock.NewMockSkillTarget(mockCtrl)
	target.EXPECT().Race().Return(4).AnyTimes()

	err := healing.Cast(target, time.Now())
	if err == nil {
		t.Fail()
	}
	t.Log(err)
}*/
