package mechanic

type EffectReceiver interface {
	RecoverHP(int)
	RecoverMP(int)
	RecoverTP(int)
	AddState(int)
	RemoveState(int)
}
type EffectList []Effect
type Effect interface {
	ApplyTo(EffectReceiver)
}

// Recover

type RecoverHP struct{ Count int }
type RecoverMP struct{ Count int }
type RecoverTP struct{ Count int }

func (e *RecoverHP) ApplyTo(r EffectReceiver) { r.RecoverHP(e.Count) }
func (e *RecoverMP) ApplyTo(r EffectReceiver) { r.RecoverMP(e.Count) }
func (e *RecoverTP) ApplyTo(r EffectReceiver) { r.RecoverTP(e.Count) }

// Increases the TP by the amount specified.
/*type GainTP struct {
	Value int // %
}*/

// State

// Adds the specified state.
// Removes the specified state.
// Specifying a value over 100% enables success at a rate higher then the target's original effectiveness.
type AddState struct{ State int }
type RemoveState struct{ State int }

func (e *AddState) ApplyTo(r EffectReceiver)    { r.AddState(e.State) }
func (e *RemoveState) ApplyTo(r EffectReceiver) { r.RemoveState(e.State) }

// Param

// Raises the fluctuation level of the specified parameter by one.
// For each level, there is a 25% fluctuation in the original value,
// and an increase of up to two levels is possible.
// To raise a parameter two or more levels at one time, you con apply this effect multiple times.
/*type AddBuff struct {
	Parameter ParameterId
	Turns     int
}

// Lowers the fluctuation level of the specified parameter by one.
// For each level, there is a 25% fluctuation in the original value,
// and an decrease of up to two levels is possible.
// To lower a parameter two or more levels at one time, you con apply this effect multiple times.
type AddDebuff struct {
	Parameter ParameterId
	Turns     int
}

// Returns the specified parameter to its original fluctuation level if it has been buffed.
type RemoveBuff struct {
	Parameter ParameterId
}

// Returns the specified parameter to its original fluctuation level if it has been debuffed.
type RemoveDebuff struct {
	Parameter ParameterId
}

// Other

// Can only be set for the [Escape] command.
// Allows the target to escape from a battle.
// No EXP will be earned.
type SpecialEffect struct {
	Effect int
}

// Permanently raises specified parameter.
// For example, this can be usud in creating an item such as fruit that gives a power-up when eaten.
type Grow struct {
	Parameter ParameterId
	Value     int // +
}

// Allows the character to learn specified skill.
// For example, this can be used in creating an item such as a book that enables a spelll to be used one it is read.
type LearnSkill struct {
	Skill SkillId
}

// Triggers the specified common event. Only one call specification for common events is valid.
type CommonEvent struct {
	Event int
}*/