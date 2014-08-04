package mechanic

import (
	"encoding/json"
	"errors"
	"github.com/coopernurse/gorp"
	"log"
	"time"
)

type Ability struct {
	Level int
	EXP   int
}

type EquipItem interface {
	SlotType() int
	TryEquip(*Actor) error
	ApplyFeatures(r FeatureReceiver)
}

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

	Equip      map[int]EquipItem
	EquipTypes map[int]bool
	EquipSlots map[int]bool

	Skills string            // json
	skills map[int]time.Time `db:"-"`

	EXP int // Experience Points
	Parameters

	States string            // json
	states map[int]time.Time `db:"-"`

	Abilities map[string]Ability
}

// db hook
func (a *Actor) PostGet(sql gorp.SqlExecutor) (err error) {
	// Skills -> skills
	err = json.Unmarshal([]byte(a.Skills), &(a.skills))
	if err != nil {
		return
	}
	// States -> states
	err = json.Unmarshal([]byte(a.States), &(a.states))
	if err != nil {
		return
	}
	return
}

func (a *Actor) TestEquipType(t int) bool {
	return a.EquipTypes[t]
}
func (a *Actor) SetEquipType(t int, v bool) {
	a.EquipTypes[t] = v
	// TODO remove equip if v==false
}
func (a *Actor) TestEquipSlot(t int) bool {
	return a.EquipSlots[t]
}
func (a *Actor) SetEquipSlot(t int, v bool) {
	a.EquipSlots[t] = v
	// TODO remove equip if v==false
}

func (a *Actor) UnEquipItem(item EquipItem) {
	a.Equip[item.SlotType()] = nil
	a.recalc()
}
func (a *Actor) EquipItem(item EquipItem) {
	if err := item.TryEquip(a); err != nil {
		log.Println("fail equip", err)
		return
	}
	a.Equip[item.SlotType()] = item
	// TODO check slot
	a.recalc()
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
	for _, equip := range a.Equip {
		equip.ApplyFeatures(a)
	}
	for id := range a.states {
		state := db.States[id]
		state.ApplyFeatures(a)
	}
}

func (a *Actor) AddSkill(id int)  { a.skills[id] = time.Unix(0, 0) }
func (a *Actor) SealSkill(id int) { delete(a.skills, id) }

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

func (a *Actor) Run() {
	c := time.Tick(1 * time.Second)
	for now := range c {
		a.UpdateStates(now)
		a.Regeneration()
	}
}

func (a *Actor) UpdateStates(now time.Time) {
	dirty := false
	for id, add_time := range a.states {
		state := db.States[id]
		if state.AutoRemoval(now, add_time) {
			dirty = true
			delete(a.states, id)
		}
	}
	if dirty {
		a.recalc()
	}
}
