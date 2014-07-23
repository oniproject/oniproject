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

	WeaponType WeaponTypeId
	Price      int
	Animation  string

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
