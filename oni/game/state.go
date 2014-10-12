package game

import (
	log "github.com/Sirupsen/logrus"
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"path"
	"time"
)

const STATE_PATH = "data/states"

type StateComponent struct {
	States map[string]*State
}

func NewStateComponent() StateComponent {
	return StateComponent{
		States: make(map[string]*State),
	}
}

func (s *StateComponent) AddState(name string) {
	state, err := LoadStateYaml(path.Join(STATE_PATH, name+".yml"))
	if err != nil {
		log.Error("AddState ", err)
		return
	}
	s.States[name] = state
}
func (s *StateComponent) RemoveState(name string) {
	delete(s.States, name)
}
func (s *StateComponent) ApplyStates(r FeatureReceiver) {
	for _, state := range s.States {
		state.ApplyFeatures(r)
	}
}

type State struct {
	// Basic settings
	Name        string
	Icon        string
	Description string

	AutoRemovalTiming time.Duration `yaml:"timing"`

	Features []string
	features FeatureList `db:"-"`
}

func LoadStateYaml(fname string) (*State, error) {
	file, err := ioutil.ReadFile(fname)
	if err != nil {
		log.Error("LoadStateYaml ", err)
		return nil, err
	}

	state := &State{}
	err = yaml.Unmarshal(file, state)
	if err != nil {
		log.Error("LoadStateYaml ", err)
		return nil, err
	}

	state.features = ParseFeatureList(state.Features)
	state.AutoRemovalTiming *= time.Millisecond

	return state, err
}

func (s *State) ApplyFeatures(r FeatureReceiver) { s.features.Run(r) }

func (s *State) CheckAutoRemoval(add_time, now time.Time) bool {
	if s.AutoRemovalTiming == 0 {
		return false
	}
	if now.Sub(add_time) >= s.AutoRemovalTiming {
		return true
	}
	return false
}
