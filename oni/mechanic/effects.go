package mechanic

type EffectReceiver interface{}
type EffectList []Effect
type Effect interface {
	Run(EffectReceiver)
}

// Recover

type RecoverHP struct {
	Procents int // %
	Count    int // +
}
type RecoverMP struct {
	Procents int // %
	Count    int // +
}
type GainTP struct {
	Value int // %
}

// State

type AddState struct {
	State  StateId
	Chance int // %
}
type RemoveState struct {
	State  StateId
	Chance int // %
}

// Param

type AddBuff struct {
	Parameter ParameterId
	Turns     int
}
type AddDebuff struct {
	Parameter ParameterId
	Turns     int
}
type RemoveBuff struct {
	Parameter ParameterId
}
type RemoveDebuff struct {
	Parameter ParameterId
}

// Other
type SpecialEffect struct {
	Effect int
}
type Grow struct {
	Parameter ParameterId
	Value     int // +
}
type LearnSkill struct {
	Skill SkillId
}
type CommonEvent struct {
	Event int
}
