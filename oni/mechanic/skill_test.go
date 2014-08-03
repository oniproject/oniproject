package mechanic

import (
	"testing"
	"time"
)

type FakeSkillTarget struct {
	HP   int
	MP   int
	race int
}

func (f *FakeSkillTarget) Race() int       { return f.race }
func (f *FakeSkillTarget) RecoverHP(v int) { f.HP += v }
func (f *FakeSkillTarget) RecoverMP(v int) { f.MP += v }
func (f *FakeSkillTarget) RecoverTP(v int) { f.MP += v }

var healing = &Skill{
	Name:      "Healing",
	Target:    TARGET_SAME_RACE,
	CastDealy: 10 * time.Second,
	onTarget:  EffectList{&RecoverHP{Count: 50}},
	onCaster:  EffectList{},
	features:  FeatureList{},
}

func TestHealing(t *testing.T) {
	caster := &FakeSkillTarget{
		race: 3,
	}
	target := &FakeSkillTarget{
		HP:   30,
		race: 3,
	}

	err := healing.Cast(caster, target, time.Now().Add(-30*time.Second))
	if err != nil {
		t.Error(err)
	}
	if target.HP != 80 {
		t.Fail()
	}
}

func TestHealingCooldown(t *testing.T) {
	caster := &FakeSkillTarget{
		race: 3,
	}
	target := &FakeSkillTarget{
		HP:   30,
		race: 3,
	}

	err := healing.Cast(caster, target, time.Now())
	if err == nil {
		t.Fail()
	}
	if target.HP != 30 {
		t.Fail()
	}
}
