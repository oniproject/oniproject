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

	Price int

	ItemType ItemTypeId
	Consume  bool
	Scope    int
	Occasion int

	Invocation Invocation
	Damage     Damage

	Effects EffectList

	// comment
	Note string
}
