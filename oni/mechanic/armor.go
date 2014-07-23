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

	Price int

	ArmorType        ArmorTypeId
	EquipType        EquipTypeId
	ParameterChanges map[ParameterId]int

	Features FeatureList

	// comment
	Note string
}
