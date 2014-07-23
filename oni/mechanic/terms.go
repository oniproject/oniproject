package mechanic

// *Id resolver
type Terms struct {
	Elements     []Element
	Parameters   []Parameter
	ExParameters []ExParameter
	SpParameters []SpParameter
	WeaponTypes  []WeaponType
	SkillTypes   []SkillType
	ArmorTypes   []ArmorType
	DamageTypes  []DamageType
}

type Element string
type ElementId int

/*
	MPM Maximum Hit Points
	MMP Maximum Magic Points
	ATK ATtacK power
	DEF DEFense power
	MAT Magic ATtack power
	MDF Magic DeFense power
	AGI AGIlity
	LUK LUcK
*/
type Parameter string
type ParameterId id

/*
	HIT HIT rate
	EVA EVAsion rate
	CRI CRItical rate
	CEV Critical EVasion rate
	MRF Magic ReFlection rate
	CNT CouNTer attack rate
	HRG Hp ReGeneration rate
	MRG Mp ReGeneration rate
	TRG Tp ReGeneration rate
*/
type ExParameter string
type ExParameterId id

/*
	TGR TarGet Rate
	GRD GuaRD effect rate
	REC RECovery effect rate
	PHA PHArmacology
	MCR Mp Cost Rate
	TCR Tp Charge Rate
	PDR Physical Damage Rate
	MDR Magical Damage Rate
	FDR Floor Damage Rate
	EXP EXperience Rate
*/
type SpParameter string
type SpParameterId id

type EquipType string
type EquipTypeId int

type SlotType string
type SlotTypeId int

type SlotType string
type SlotTypeId int

type Ability string
type AbilityId int

type AnimationId int
