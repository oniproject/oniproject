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
	Occacion  int

	Invocation Invocation
	Damage     Damage

	UsignMessage    string
	RequiredWeapon1 int
	RequiredWeapon2 int

	Effects EffectList

	// comment
	Note string
}
