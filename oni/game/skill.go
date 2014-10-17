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

	_ = iota
	TARGET_ANOTHER_RACE
	TARGET_SAME_RACE
	TARGET_MONSTER
	TARGET_SELF
	TARGET_ANYWHERE = TARGET_ANOTHER_RACE | TARGET_SAME_RACE | TARGET_MONSTER
)

var (
	SkillFailTarget   = errors.New("fail target")
	SkillFailCooldown = errors.New("fail cooldown")
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
func (s *SkillComponent) Cast(name string, target SkillTarget) error {
	skill, ok := s.Skills[name]
	if !ok {
		err := errors.New("skill notfound")
		log.Error("Cast ", err, s)
		return err
	}
	err := skill.Cast(target, s.skills_lastCast[name])
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

	Type string `yaml:"type"`

	Target int
	//Range  int
	//Required  int

	CastDealy time.Duration `yaml:"cast-dealy"`

	Animation int

	OnTarget EffectList `yaml:"effects"`

	HPused int `yaml:"hp"`
	MPused int `yaml:"mp"`
	TPused int `yaml:"tp"`

	UsableWith []string `yaml:"with"`

	// stackoverflow? nowai
	unmarshaled bool `json:"-"`
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

	skill.CastDealy *= time.Millisecond

	return skill, err
}

func (s *Skill) Cast(target SkillTarget, lastCast time.Time) error {
	if s.Target == 0 {
		return SkillFailTarget
	}

	if time.Now().Sub(lastCast) < s.CastDealy {
		return SkillFailCooldown
	}

	log.Println("Cast Skill", s)

	s.OnTarget.ApplyTo(target)

	return nil
}
