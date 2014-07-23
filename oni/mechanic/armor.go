package mechanic

type ArmorId int
type ArmorList []Armor

type ArmorType string
type ArmorTypeId int

type Armor struct {
	// Basic settings
	Name        string
	Icon        string
	Description string

	ArmorType ArmorTypeId
	Price     int
	EquipType string

	// Parameter Changes
	ATK int
	DEF int
	MAT int
	MDF int
	AGI int
	LUK int
	MHP int
	MMP int
	MSP int

	Features FeatureList

	// comment
	Note string
}
