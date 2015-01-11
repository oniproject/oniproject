package game

import (
	log "github.com/Sirupsen/logrus"
	//"github.com/oniproject/geom"
	"oniproject/oni/utils"
)

type CastMsg struct {
	Type   string   `mapstructure:"s"`
	Target utils.Id `mapstructure:"t"`
}

func (m *CastMsg) Run(obj GameObject) {
	caster := obj.(*Avatar)

	skill, ok := caster.Skills[m.Type]
	if !ok {
		log.Errorf("cast Fail: Skill %s not learning ", m.Type)
		return
	}

	if skill.HPused > caster.HP || skill.MPused > caster.MP || skill.TPused > caster.TP {
		log.Error("cast FAIL: needed moar HP|MP|TP ", m)
		return
	}

	target := caster.GetObjById(m.Target)

	if m.Target == 0 {
		if skill.Target&TARGET_SELF != 0 {
			target = caster
		}
		log.Error("cast FAIL: zero target ", m)
		return
	}

	if target == nil {
		log.Error("cast FAIL: target notfound ", m)
		return
	}

	check := false

	switch target := target.(type) {
	case *Monster:
		check = skill.Target&TARGET_MONSTER != 0
	case *Avatar:
		equals := caster == target
		race := caster.Race() == target.Race()

		self := equals && skill.Target&TARGET_SELF != 0
		same := !equals && race && skill.Target&TARGET_SAME_RACE != 0
		another := !equals && !race && skill.Target&TARGET_ANOTHER_RACE != 0

		check = self || same || another
	default:
		log.Warn("Fail Target typeSwithc")
		return
	}

	if !check {
		log.Warn("Fail Target")
		return
	}

	if err := caster.Cast(m.Type, target); err != nil {
		log.Error("cast ", err)
		return
	}

	caster.RecoverHP(float64(-skill.HPused))
	caster.RecoverMP(float64(-skill.MPused))
	caster.RecoverTP(float64(-skill.TPused))

	if hp, _ := target.HPbar(); hp == 0 {
		switch target := target.(type) {
		case *Avatar:
			target.HRG = 0 // FIXME
			target.state = STATE_DEAD
		case *Monster:
			target.HRG = 0 // FIXME
			caster.Unregister(target)
		}
	}

	caster.sendMessage <- &ParametersMsg{Parameters: caster.Parameters, Skills: caster.Skills}
	caster.Map.Replicator.Update(target)

	log.Infof("cast OK: %v %d", m, m.Target)
}
