package mechanic

type SkillId int
type SkillList []Skill

type SkillType string
type SkillTypeId int

type Skill struct {
	// Basic settings
	Name        string
	Icon        string
	Description string

	SkillType SkillTypeId
	MPCost    int
	TPCost    int
	Scope     int
	Ossacion  int

	// Invocation
	Speed     int
	Success   int // %
	Repeats   int
	TPGain    int
	HitType   int
	Animation int

	UsignMessage    string
	RequiredWeapon1 int
	RequiredWeapon2 int

	// Damage
	DamageType int
	Element    int
	Formula    string
	Variance   int
	Critical   bool

	Effects EffectList

	// comment
	Note string
}
