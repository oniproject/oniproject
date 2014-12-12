package skill

import (
	"gopkg.in/yaml.v2"
	"io/ioutil"
	. "oniproject/oni/artemis"
	"path"
	"time"
)

type SkillSystem struct {
	cacheOfSkillsData map[string]Skill
	*BaseSystem
}

func NewSkillSystem() (sys *SkillSystem) {
	sys = &SkillSystem{
		cacheOfSkillsData: make(map[string]Skill),
	}
	sys.BaseSystem = NewBaseSystem(NewAspectFor((*SkillComponent)(nil)), sys)
	return
}

func (sys *SkillSystem) ProcessEntities(entities []Entity) {
	/*
		for _, e := range entities {
			p := e.ComponentByType(STATE).(*SkillComponent)
			if sys.check(p, now) {
				e.ChangedInWorld()
			}
		}
	*/
}

func (sys *SkillSystem) CheckProcessing() bool { return true }
func (sys *SkillSystem) Inserted(e Entity)     {}
func (sys *SkillSystem) Removed(e Entity)      {}

/// .......

func (sys *SkillComponent) AddSkill(e Entity, name string) (skill Skill, err error) {
	skill, err = sys.loadSkill(name)
	if err != nil {
		return
	}
	s := e.ComponentByType(SKILL).(*SkillComponent)
	s.Skills[name] = time.Time{}
	return
}

func (sys *SkillComponent) SealSkill(e Entity, name string) (skill Skill, err error) {
	skill, err = sys.loadSkill(name)
	if err != nil {
		return
	}
	s := e.ComponentByType(SKILL).(*SkillComponent)
	delete(s.Skills, name)
	return
}

func (sys *SkillComponent) Cast(e Entity, name string) (skill Skill, err error) {
	skill, err = sys.loadSkill(name)
	if err != nil {
		return
	}
	s := e.ComponentByType(SKILL).(*SkillComponent)

	lastCast, ok := s.Skills[name]
	if !ok {
		err = SkillNotFound
		return
	}

	if time.Now().Sub(lastCast) < skill.CastDealy {
		err = SkillFailCooldown
		return
	}

	s.Skills[name] = time.Now()
	return
}

func (sys *SkillComponent) loadSkill(name string) (skill Skill, err error) {
	fname := path.Join(SKILL_PATH, name+".yml")

	file, err := ioutil.ReadFile(fname)
	if err != nil {
		return
	}

	err = yaml.Unmarshal(file, &skill)
	if err != nil {
		return
	}

	skill.CastDealy *= time.Millisecond

	return skill, err
}
