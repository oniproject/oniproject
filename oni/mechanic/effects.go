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
	State  int
	Chance int // %
}
type RemoveState struct {
	State  int
	Chance int // %
}

// Param

type AddBuff struct {
	Parameter int
	Turns     int
}
type AddDebuff struct {
	Parameter int
	Turns     int
}
type RemoveBuff struct {
	Parameter int
}
type RemoveDebuff struct {
	Parameter int
}

// Other
type SpecialEffect struct {
	Effect int
}
type Grow struct {
	Parameter int
	Value     int // +
}
type LearnSkill struct {
	Skill int
}
type CommonEvent struct {
	Event int
}
