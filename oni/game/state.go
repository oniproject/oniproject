package game

import (
	"encoding/json"
	"github.com/coopernurse/gorp"
	"time"
)

type State struct {
	// Basic settings
	Name        string
	Icon        string
	Description string

	AutoRemovalTiming time.Duration

	Features string
	features FeatureList `db:"-"`
}

// db hook
func (s *State) PostGet(sql gorp.SqlExecutor) (err error) {
	// Features -> features
	err = json.Unmarshal([]byte(s.Features), &(s.features))
	return
}

func (s *State) ApplyFeatures(r FeatureReceiver) { s.features.Run(r) }

func (s *State) AutoRemoval(now, add_time time.Time) bool {
	if s.AutoRemovalTiming == 0 {
		return false
	}
	if now.Sub(add_time) < s.AutoRemovalTiming {
		return true
	}
	return false
}
