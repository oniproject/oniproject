package mechanic

import (
	"testing"
	"time"
)

type FakeSkillTarget struct {
	Parameters
	race int

	states map[int]*State
}

func (f *FakeSkillTarget) Race() int { return f.race }

func (f *FakeSkillTarget) AddState(id int) {
	state := &State{}
	f.states[id] = state
	// recalc all params
}
func (f *FakeSkillTarget) RemoveState(id int) {
	delete(f.states, id)
	// recalc all params
}

var healing = &Skill{
	Name:      "Healing",
	Target:    TARGET_SAME_RACE,
	CastDealy: 10 * time.Second,
	onTarget:  EffectList{&RecoverHP{Count: 50}},
	onCaster:  EffectList{&RecoverMP{Count: -10}},
}
var caster = &FakeSkillTarget{
	Parameters: Parameters{
		MP: 30, MMP: 40,
	},
	race: 3,
}

func TestHealing(t *testing.T) {
	target := &FakeSkillTarget{
		Parameters: Parameters{
			HP: 30, MHP: 70,
		},
		race: 3,
	}

	err := healing.Cast(caster, target, time.Now().Add(-30*time.Second))
	if err != nil {
		t.Error(err)
	}
	if caster.Parameters.MP != 20 {
		t.Fail()
	}
	// 80 > MHP=70
	if target.Parameters.HP != 70 {
		t.Fail()
	}
}

func TestHealingCooldown(t *testing.T) {
	target := &FakeSkillTarget{
		Parameters: Parameters{
			HP: 30, MHP: 70,
		},
		race: 3,
	}

	err := healing.Cast(caster, target, time.Now())
	if err == nil {
		t.Fail()
	}
	if target.Parameters.HP != 30 {
		t.Fail()
	}
}
