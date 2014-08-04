package mechanic

type WeaponId int
type WeaponList []Weapon

type WeaponType string
type WeaponTypeId int

type Weapon struct {
	// Basic settings
	Name        string
	Icon        string
	Description string

	Price int

	WeaponType int
	Animation  int
	//ParameterChanges map[ParameterId]int

	Features FeatureList

	// comment
	Note string
}
