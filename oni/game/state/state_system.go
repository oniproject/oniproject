package state

import (
	"gopkg.in/yaml.v2"
	"io/ioutil"
	. "oniproject/oni/artemis"
	"path"
	"time"
)

type StateSystem struct {
	cacheOfStateData map[string]State
	*BaseSystem
}

func NewStateSystem() (sys *StateSystem) {
	sys = &StateSystem{
		cacheOfStateData: make(map[string]State),
	}
	sys.BaseSystem = NewBaseSystem(NewAspectFor((*StateComponent)(nil)), sys)
	return
}

func (sys *StateSystem) ProcessEntities(entities []Entity) {
	now := time.Now()
	for _, e := range entities {
		p := e.ComponentByType(STATE).(*StateComponent)
		if sys.checkAutoRemoval(p, now) {
			e.ChangedInWorld()
		}
	}
}

func (sys *StateSystem) checkAutoRemoval(s *StateComponent, now time.Time) (changed bool) {
	for name, t := range s.States {
		state := sys.cacheOfStateData[name]
		if state.AutoRemovalTiming > 0 && now.Sub(t) > state.AutoRemovalTiming {
			delete(s.States, name)
			changed = true
		}
	}
	return
}

func (sys *StateSystem) CheckProcessing() bool { return true }
func (sys *StateSystem) Inserted(e Entity)     {}
func (sys *StateSystem) Removed(e Entity)      {}

/*TODO func (sys *StateSystem) ApplyStates(e Entity, r FeatureReceiver) {
	s := e.ComponentByType(STATE).(*StateComponent)
	for _, state := range s.States {
		state.Features.Run(r)
	}
}*/

func (sys *StateSystem) AddStateTo(e Entity, name string) (state State, err error) {
	s := e.ComponentByType(STATE).(*StateComponent)
	state, err = sys.loadState(name)
	if err == nil {
		s.States[name] = time.Now()
	}
	return
}

func (sys *StateSystem) RemoveStateFrom(e Entity, name string) {
	s := e.ComponentByType(STATE).(*StateComponent)
	delete(s.States, name)
}

func (sys *StateSystem) States(e Entity) (states map[string]State) {
	s := e.ComponentByType(STATE).(*StateComponent)
	states = make(map[string]State)
	for state := range s.States {
		states[state] = sys.cacheOfStateData[state]
	}
	return
}

func (sys *StateSystem) loadState(name string) (state State, err error) {
	state, ok := sys.cacheOfStateData[name]
	if ok {
		return
	}

	fname := path.Join(STATE_PATH, name+".yml")

	file, err := ioutil.ReadFile(fname)
	if err != nil {
		return
	}

	err = yaml.Unmarshal(file, &state)
	if err != nil {
		return
	}

	//state.features = ParseFeatureList(state.Features)
	state.AutoRemovalTiming *= time.Millisecond

	sys.cacheOfStateData[name] = state

	return
}

/*func (s *State) ApplyFeatures(r FeatureReceiver) { s.Features.Run(r) }

func (s *State) CheckAutoRemoval(add_time, now time.Time) bool {
	if s.AutoRemovalTiming == 0 {
		return false
	}
	if now.Sub(add_time) >= s.AutoRemovalTiming {
		return true
	}
	return false
}*/
