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
	Skills map[int]*Cooldown

	/*Class ClassId
	//Race RaceId

	EXP int // Experience Points
	HP  int // Hit Points
	MP  int // Magic Points
	TP  int // Tehnical Points
	DPS int // Damage Per Second

	Parameters   map[ParameterId]int
	ExParameters map[ExParameterId]int
	SpParameters map[SpParameterId]int
	*/
}

func (a *Actor) RunSkill(skill int) error {
	enabled, ok := a.Skills[skill]
	if !ok {
		return errors.New("skill not found")
	}
	if enabled != nil {
		return errors.New("skill is cool")
	}
	/* TODO get skill data
	s := ... get skill
	// send skill
	s.Call
	t := s.CooldownTime
	*/
	t := 10 * time.Second
	if t != 0 {
		//a.Cooldowns = append(a.Cooldowns, NewCooldown(a, skill, t))
		a.Skills[skill] = NewCooldown(t)
	}
	return nil
}
func (a *Actor) UpdateCooldowns(t time.Duration) {
	for skill, c := range a.Skills {
		if c != nil && c.Update(t) {
			// remove cooldown
			a.Skills[skill] = nil
		}
	}
}
