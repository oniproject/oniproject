package game

import (
	"errors"
	log "github.com/Sirupsen/logrus"
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"path"
	"time"
)

const (
	SKILL_PATH = "data/skills"

	TARGET_PASSIVE      = 0
	TARGET_ANOTHER_RACE = 1
	TARGET_SAME_RACE    = 2
	TARGET_MONSTER      = 4
	TARGET_ANYWHERE     = TARGET_ANOTHER_RACE | TARGET_SAME_RACE | TARGET_MONSTER
)

type SkillComponent struct {
	Skills          map[string]*Skill
	skills_lastCast map[string]time.Time
}

func NewSkillComponent() SkillComponent {
	return SkillComponent{
		Skills:          make(map[string]*Skill),
		skills_lastCast: make(map[string]time.Time),
	}
}

func (s *SkillComponent) AddSkill(name string) {
	skill, err := LoadSkillYaml(path.Join(SKILL_PATH, name+".yml"))
	if err != nil {
		log.Error("AddSkill ", err)
		return
	}
	s.Skills[name] = skill
	s.skills_lastCast[name] = time.Now()
}
func (s *SkillComponent) SealSkill(name string) {
	delete(s.Skills, name)
}
func (s *SkillComponent) Cast(name string, caster, target SkillTarget) error {
	skill, ok := s.Skills[name]
	if !ok {
		err := errors.New("skill notfound")
		log.Error("Cast ", err, s)
		return err
	}
	err := skill.Cast(caster, target, s.skills_lastCast[name])
	if err != nil {
		return err
	}
	s.skills_lastCast[name] = time.Now()
	return nil
}

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

	SkillType string `yaml:"type"`

	Target int
	//Range  int
	//Required  int

	CastDealy time.Duration `yaml:"cast-dealy"`

	Animation int

	//EffectsOnTarget string     // json
	OnTarget []string   `yaml:"ontarget"`
	onTarget EffectList `db:"-"`
	//EffectsOnCaster string     // json
	OnCaster []string   `yaml:"oncaster"`
	onCaster EffectList `db:"-"`
}

func LoadSkillYaml(fname string) (*Skill, error) {
	file, err := ioutil.ReadFile(fname)
	if err != nil {
		log.Error("LoadSkillYaml ", err)
		return nil, err
	}

	skill := &Skill{}
	err = yaml.Unmarshal(file, skill)
	if err != nil {
		log.Error("LoadSkillYaml ", err)
		return nil, err
	}

	skill.onCaster = ParseEffectList(skill.OnCaster)
	skill.onTarget = ParseEffectList(skill.OnTarget)
	skill.CastDealy *= time.Millisecond

	return skill, err
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

	s.onCaster.ApplyTo(caster)
	s.onTarget.ApplyTo(target)

	return nil
}
