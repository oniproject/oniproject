package game

import (
	"strconv"
	"strings"
)

type FeatureReceiver interface {
	AddATK(int)
	AddDEF(int)
	AddSkill(int)
	SealSkill(int)

	//SetEquipSlot(int, bool)
	//SetEquipType(int, bool)
}

func ParseFeatureList(src []string) (dst FeatureList) {
	for _, line := range src {
		args := strings.Split(line, " ")
		name := args[0]
		value, err := strconv.ParseInt(args[1], 10, 32)
		if err != nil {
			continue
		}
		switch name {
		case "atk":
			dst = append(dst, AddATK{int(value)})
		case "def":
			dst = append(dst, AddDEF{int(value)})
		case "skill":
			dst = append(dst, AddSkill{int(value)})
		case "rm-skill":
			dst = append(dst, SealSkill{int(value)})
		}
	}
	return
}

type FeatureList []Feature

func (list FeatureList) Run(r FeatureReceiver) {
	for _, f := range list {
		f.Run(r)
	}
}

type Feature interface {
	Run(FeatureReceiver)
}

// change parameters

type AddATK struct{ Value int }
type AddDEF struct{ Value int }

func (f AddATK) Run(r FeatureReceiver) { r.AddATK(f.Value) }
func (f AddDEF) Run(r FeatureReceiver) { r.AddDEF(f.Value) }

// Rate

// Changes the damage multipler according to the specified elements.
// The higher the value, the greater the weakness against the element.
/*type ElementRate struct {
	Element ElementId
	Value   int // * %
}

// Changes the probability at which the use of a skill or item will succed in debuffing a parameter.
type DebuffRate struct {
	Parameter ParameterId
	Value     int // * %
}

// Changes the probability at which the use of a skill or item will succed in applying a state.
type StateRate struct {
	State StateId
	Value int // * %
}

// Completely negates a state. If knockouts are negated, characters will not be knocked out even when their HP falls 0.
type StateResist struct {
	State StateId
	Value int // * %
}

// Param

// Rate of change for the specified parameter.
type Parameter struct {
	Parameter ParameterId
	Value     int // * %
}

// A value added to the specified ex-parameter.
type ExParameter struct {
	ExParameter ExParameterId
	Value       int // + %
}

// Rate of change for the specified sp-parameter.
type SpParameter struct {
	SpParameter SpParameterId
	Value       int // * %
}

// Attack

// Normal attack element.
type AtkElement struct {
	Element ElementId
}

// State applied as additional effect of a normal attack.
type AtkState struct {
	State ElementId
	Value int // + %
}

// Value that is added to agility when determining attack order when a normal attack has been selected.
type AtkSpeed struct {
	Speed int
}

// Increases the nimber of times a normal attack hits a target. Entering "+1" means two consecutive attacks.
type AtkTimes struct {
	Times int
}*/

// Skill

// Allow the specified skill type to be selected as a command.
/*type AddSkillType struct {
	SkillType SkillTypeId
}

// Temporarily disables the use of the specified type of skill.
type SealSkillType struct {
	SkillType SkillType
}*/

// Set the specified skills as being learned.
type AddSkill struct{ SkillId int }
type SealSkill struct{ SkillId int }

func (f AddSkill) Run(r FeatureReceiver)  { r.AddSkill(f.SkillId) }
func (f SealSkill) Run(r FeatureReceiver) { r.SealSkill(f.SkillId) }

// Equip

// Enables the equipping of the specified type of slot.
/*type AddEquipSlot struct{ SlotId int }
type SealEquipSlot struct{ SlotId int }

func (f *AddEquipSlot) Run(r FeatureReceiver)  { r.SetEquipSlot(f.SlotId, true) }
func (f *SealEquipSlot) Run(r FeatureReceiver) { r.SetEquipSlot(f.SlotId, false) }

// Enables the equipping of the specified type of equip.
type AddEquipType struct{ EquipTypeId int }
type SealEquipType struct{ EquipTypeId int }

func (f *AddEquipType) Run(r FeatureReceiver)  { r.SetEquipType(f.EquipTypeId, true) }
func (f *SealEquipType) Run(r FeatureReceiver) { r.SetEquipType(f.EquipTypeId, false) }
*/

// Enables the equipping of the specified type of armor.
/*type EquipArmor struct {
	ArmorId int
}

// Prevents the changing of equipment for the specified equipment slot.
// Used mainly for instances such as when you do not want the player changing the equipment
//  of a character that has been temporarily added to the party.
type FixEquip struct {
	Equip EquipTypeId
}

// Prevents the equipment of any equipment for the specified equipment slot.
// For example, preventing the use of shields for a given weapon makes it a two-handed weapon,
//  and preventing the wearing of a headgear for a given piece of armor results full body armor.
type SealEquip struct {
	Equip EquipTypeId
}

// Can only be set to [Dual Wield].
// This enables the equipping of two weapons in excange for not being able to equip a shield.
type SlotType struct {
	Slot SlotTypeId
}*/

// Other

// Increases the nimber of times action can be taken in battle by the specified probability.
// For example, entering 50% twice results in a character thea has a 50% chance of acting twice and a 25% chance of acting three times.
type ActionTimes struct {
	Times int // + %
}

// Special States
//	[Auto Battle] Chanracter acts independently without accepting commands in battle.
//	[Guard] Reduces damage taken at a set rate.
//	[Substitude] Chanracter suffers attack in place of alies with less HP.
//	[Prererve TP] Accumulated TP are retained for the next battle.
type SpecialFlag struct {
	Flag int
}

// Valid only for enemies.
// Changes the effect for when they are knocked out.
type CollapseEffect struct {
	Effect int
}

// Valid only for actors.
// This is an ability that is shared by the entire party.
// It is enabled if at least one of the party members participating in a battle ahs this characteristic.
type PatyAbility struct {
	Ability int
}
