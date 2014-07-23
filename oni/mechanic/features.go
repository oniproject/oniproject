package mechanic

type FeatureReceiver interface{}
type FeatureList []Feature
type Feature interface {
	Run(FeatureReceiver)
}

// Rate

type ElementRate struct {
	Element int
	Value   int // * %
}
type DebuffRate struct {
	Parameter int
	Value     int // * %
}
type StateRate struct {
	State int
	Value int // * %
}
type StateResist struct {
	State int
	Value int // * %
}

// Param

type Parameter struct {
	Parameter int
	Value     int // * %
}
type ExParameter struct {
	ExParameter int
	Value       int // + %
}
type SpParameter struct {
	ExParameter int
	Value       int // * %
}

// Attack

type AtkElement struct {
	Element int
}
type AtkState struct {
	State int
	Value int // + %
}
type AtkSpeed struct {
	Speed int
}
type AtkTimes struct {
	Times int
}

// Skill

type AddSkillType struct {
	SkillType int
}
type SealSkillType struct {
	SkillType int
}
type AddSkill struct {
	Skill int
}
type SealSkill struct {
	Skill int
}

// Equip

type EquipWeapon struct {
	Weapon int
}
type EquipArmor struct {
	Armor int
}
type FixEquip struct {
	Equip int
}
type SealEquip struct {
	Equip int
}
type SlotType struct {
	Slot int
}

// Other

type ActionTimes struct {
	Times int // + %
}
type SpecialFlag struct {
	Flag int
}
type CollapseEffect struct {
	Effect int
}
type PatyAbility struct {
	Ability int
}
