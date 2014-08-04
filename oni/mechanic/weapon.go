package mechanic

import "errors"

type Weapon struct {
	// Basic settings
	Name        string
	Icon        string
	Description string

	Price int

	EquipTypeId int
	SlotTypeId  int
	Animation   int

	Features FeatureList

	// comment
	Note string
}

func (w *Weapon) SlotType() int { return w.SlotTypeId }
func (w *Weapon) TryEquip(actor *Actor) error {
	// TODO check level and others
	if !actor.TestEquipType(w.EquipTypeId) {
		return errors.New("fail weapon type")
	}
	return nil
}
