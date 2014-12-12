package state

import (
	. "oniproject/oni/artemis"
	"time"
)

var STATE_PATH = "data/states"

var STATE = GetIndexFor((*StateComponent)(nil))

type State struct {
	// Basic settings
	Name        string
	Icon        string
	Description string

	AutoRemovalTiming time.Duration `yaml:"timing"`

	//TODO Features FeatureList
	//features FeatureList `db:"-"`
}

type StateComponent struct {
	States map[string]time.Time
}

func NewStateComponent() *StateComponent {
	return &StateComponent{
		States: make(map[string]time.Time),
	}
}

func (s *StateComponent) Name() string { return "states" }
