package mechanic

import (
	"errors"
	"github.com/coopernurse/gorp"
	"log"
	"time"
)

type SkillId int
type SkillList []Skill

type SkillType string
type SkillTypeId int

const (
	TARGET_PASSIVE      = 0
	TARGET_ANOTHER_RACE = 1
	TARGET_SAME_RACE    = 2
	TARGET_MONSTER      = 4
	TARGET_ANYWHERE     = TARGET_ANOTHER_RACE | TARGET_SAME_RACE | TARGET_MONSTER
)

type SkillTarget interface {
	// race == 0 is a Monster
	Race() int
	//Position() geom.Coord
	EffectReceiver
}

type Skill struct {
	// Basic settings
	Name        string
	Icon        string
	Description string

	SkillType int
	Class     int

	Target int
	//Range  int
	//Required  int

	CastDealy time.Duration `cooldown time`

	Animation int

	EffectsOnTarget string // json
	onTarget        EffectList
	EffectsOnCaster string // json
	onCaster        EffectList

	// comment
	Note string
}

// db hook
func (s *Skill) PostGet(sql gorp.SqlExecutor) error {
	// TODO EffectsOnTarget -> onTarget
	// TODO EffectsOnCaster -> onCaster
	return nil
}

func (s *Skill) Cast(caster, target SkillTarget, lastCast time.Time) error {
	if s.Target == TARGET_PASSIVE {
		return errors.New("fail target TARGET_PASSIVE")
	}
	if target.Race() == 0 {
		if s.Target&TARGET_MONSTER == 0 {
			return errors.New("fail target TARGET_MONSTER")
		}
	} else {
		switch {
		case caster.Race() != target.Race() && s.Target&TARGET_ANOTHER_RACE == 0:
			return errors.New("fail target TARGET_ANOTHER_RACE")
		case caster.Race() == target.Race() && s.Target&TARGET_SAME_RACE == 0:
			return errors.New("fail target TARGET_SAME_RACE")
		}
	}

	if time.Now().Sub(lastCast) < s.CastDealy {
		return errors.New("fail cooldown")
	}

	log.Println("Cast Skill", s)

	// TODO Required
	// TODO Range

	for _, e := range s.onCaster {
		e.ApplyTo(caster)
	}
	for _, e := range s.onTarget {
		e.ApplyTo(target)
	}

	return nil
}
