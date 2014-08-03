package mechanic

import (
	"github.com/coopernurse/gorp"
	"time"
)

type StateId int

type State struct {
	// Basic settings
	Name        string
	Icon        string
	Description string

	AutoRemovalTiming time.Duration

	Features string
	features FeatureList

	// comment
	Note string
}

// db hook
func (s *State) PostGet(sql gorp.SqlExecutor) error {
	// TODO Features -> features
	return nil
}

func (s *State) ApplyFeatures(r FeatureReceiver) {
	for _, f := range s.features {
		f.Run(r)
	}
}

func (s *State) AutoRemoval(add_time time.Time) bool {
	if time.Now().Sub(add_time) < s.AutoRemovalTiming {
		return true
	}
	return true
}
