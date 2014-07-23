package mechanic

type FeatureReceiver interface{}
type FeatureList []Feature
type Feature interface {
	Run(FeatureReceiver)
}

// Rate

type ElementRate struct {
	Element ElementId
	Value   int // * %
}
type DebuffRate struct {
	Parameter ParameterId
	Value     int // * %
}
type StateRate struct {
	State StateId
	Value int // * %
}
type StateResist struct {
	State StateId
	Value int // * %
}

// Param

type Parameter struct {
	Parameter ParameterId
	Value     int // * %
}
type ExParameter struct {
	ExParameter ExParameterId
	Value       int // + %
}
type SpParameter struct {
	SpParameter SpParameterId
	Value       int // * %
}

// Attack

type AtkElement struct {
	Element ElementId
}
type AtkState struct {
	State ElementId
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
	SkillType SkillTypeId
}
type SealSkillType struct {
	SkillType SkillType
}
type AddSkill struct {
	Skill SkillId
}
type SealSkill struct {
	Skill SkillId
}

// Equip

type EquipWeapon struct {
	Weapon WeaponId
}
type EquipArmor struct {
	Armor ArmorId
}
type FixEquip struct {
	Equip EquipTypeId
}
type SealEquip struct {
	Equip EquipTypeId
}
type SlotType struct {
	Slot SlotTypeId
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
	Ability AbilityId
}
