package mechanic

import "errors"

type Armor struct {
	// Basic settings
	Name        string
	Icon        string
	Description string

	Price int

	EquipTypeId int
	SlotTypeId  int

	Features string
	features FeatureList `db:"-"`

	// comment
	Note string
}

func (a *Armor) SlotType() int { return a.SlotTypeId }
func (a *Armor) TryEquip(actor *Actor) error {
	// TODO check level and others
	if !actor.TestEquipType(a.EquipTypeId) {
		return errors.New("fail armor type")
	}
	return nil
}

func (a *Armor) ApplyFeatures(r FeatureReceiver) {
	for _, f := range a.features {
		f.Run(r)
	}
}
