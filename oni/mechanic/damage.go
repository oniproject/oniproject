package mechanic

type DamageType string
type DamageTypeId int

type Damage struct {
	DamageType DamageTypeId
	Element    ElementId
	Formula    string
	Variance   int
	Critical   bool
}
