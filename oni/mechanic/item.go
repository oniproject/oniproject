package mechanic

type ItemId int
type ItemList []Item

type ItemType string
type ItemTypeId int

type Item struct {
	// Basic settings
	Name        string
	Icon        string
	Description string

	ItemType ItemTypeId
	Price    int
	Consume  bool
	Scope    int
	Occasion int

	// Invocation
	Speed     int
	Success   int // %
	Repeats   int
	TPGain    int
	HitType   int
	Animation int

	// Damage
	DamageType int
	Element    int
	Formula    string
	Variance   int
	Critical   bool

	Effects EffectList

	// comment
	Note string
}
