package skill

import (
	"errors"
	. "oniproject/oni/artemis"
	"time"
)

var (
	SKILL      = GetIndexFor((*SkillComponent)(nil))
	SKILL_PATH = "data/skills"
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
	SkillNotFound     = errors.New("Skill not found")
	SkillFailCooldown = errors.New("Skill fail cooldown")
)

/*type SkillTarget interface {
	// race == 0 is a Monster
	Race() int
	//Position() geom.Coord
	EffectReceiver
}*/

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

	// TODO OnTarget EffectList `yaml:"effects"`

	HPused int `yaml:"hp"`
	MPused int `yaml:"mp"`
	TPused int `yaml:"tp"`

	UsableWith []string `yaml:"with"`

	// stackoverflow? nowai
	// TODO unmarshaled bool `json:"-"`
}

type SkillComponent struct {
	Skills map[string]time.Time
}

func (c *SkillComponent) Name() string { return "skills" }

func NewSkillComponent() *SkillComponent {
	return &SkillComponent{
		Skills: make(map[string]time.Time),
	}
}
