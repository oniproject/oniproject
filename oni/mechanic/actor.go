package mechanic

import (
	"errors"
	"time"
)

type Actor struct {
	Nickname string
	ClassId  int
	RaceId   int

	Level struct {
		Initial int
		Max     int
		Current int
	}

	Character struct {
		Image string
		Face  string
		// ... other graphic
	}

	// index - SlotId
	//Equips []Equip
	//Cooldowns []*Cooldown
	skills map[int]time.Time

	/*Class ClassId
	//Race RaceId
	*/

	EXP int // Experience Points
	Parameters
	//HP  int // Hit Points
	//MP  int // Magic Points
	//TP  int // Tehnical Points
	DPS int // Damage Per Second
	/*
		Parameters   map[ParameterId]int
		ExParameters map[ExParameterId]int
		SpParameters map[SpParameterId]int
	*/
	//db

	states map[int]time.Time
}

func (a *Actor) Race() int { return a.RaceId }

func (a *Actor) AddState(id int) {
	a.states[id] = time.Now()
	a.recalc()
}
func (a *Actor) RemoveState(id int) {
	delete(a.states, id)
	a.recalc()
}

// recalc all params
func (a *Actor) recalc() {
	// TODO set params to zero
	for id := range a.states {
		state := db.States[id]
		state.ApplyFeatures(a)
	}
}

func (a *Actor) Cast(id int, target SkillTarget) error {
	lastCast, ok := a.skills[id]
	if !ok {
		return errors.New("skill not found")
	}

	if target == nil {
		target = a
	}

	skill := db.Skills[id]
	err := skill.Cast(a, target, lastCast)
	if err != nil {
		a.skills[id] = time.Now()
	}

	return err
}

func (a *Actor) UpdateStates() {
	dirty := false
	for id, add_time := range a.states {
		state := db.States[id]
		if state.AutoRemoval(add_time) {
			a.RemoveState(id)
			dirty = true
			delete(a.states, id)
		}
	}
	if dirty {
		a.recalc()
	}
}
