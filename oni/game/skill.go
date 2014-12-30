package game

import (
	"errors"
	log "github.com/Sirupsen/logrus"
	"github.com/robertkrimen/otto"
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"path"
	"sync"
	"time"
)

var (
	SKILL_VM    = otto.New()
	SKILL_PATH  = "data/skills"
	skill_mutex = sync.Mutex{}
)

const (
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
	log.Println("addSkill", name)
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

	OnTarget       string       `yaml:"effect"`
	onTargetScript *otto.Script `json:"-"`

	HPused int `yaml:"hp"`
	MPused int `yaml:"mp"`
	TPused int `yaml:"tp"`

	UsableWith []string `yaml:"with"`
}

func LoadSkillYaml(fname string) (skill *Skill, err error) {
	file, err := ioutil.ReadFile(fname)
	if err != nil {
		log.Error("LoadSkillYaml ", err)
		return nil, err
	}

	skill = &Skill{}
	err = yaml.Unmarshal(file, skill)
	if err != nil {
		log.Error("LoadSkillYaml ", err)
		return nil, err
	}

	skill.CastDealy *= time.Millisecond

	return skill, err
}

func (s *Skill) Cast(target interface{}, lastCast time.Time) (err error) {
	if time.Now().Sub(lastCast) < s.CastDealy {
		return SkillFailCooldown
	}

	log.Println("Cast Skill", s)

	skill_mutex.Lock()
	defer skill_mutex.Unlock()
	if s.onTargetScript == nil {
		s.onTargetScript, err = SKILL_VM.Compile("", s.OnTarget)
		if err != nil {
			return
		}
	}

	err = SKILL_VM.Set("target", target)
	if err != nil {
		return
	}

	//_, err = SKILL_VM.Run(s.OnTarget)
	_, err = SKILL_VM.Run(s.onTargetScript)

	// FIXME cbor not ignore unexporting tags
	s.onTargetScript = nil

	return
}
