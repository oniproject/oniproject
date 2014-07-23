package mechanic

// *Id resolver
type Terms struct {
	Elements     []string
	Parameters   []string
	ExParameters []string
	SpParameters []string
	WeaponTypes  []string
	SkillTypes   []string
	ArmorTypes   []string
	DamageTypes  []string
	EquipTypes   []string
	Abilities    []string
}

type ElementId int
type EquipTypeId int
type SlotTypeId int
type SlotTypeId int
type AbilityId int
type AnimationId int

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
type SpParameterId id
