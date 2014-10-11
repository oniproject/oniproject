package game

// TODO sync
// TODO check item parameters (maybe in message?)

import "errors"
import "sync"

var (
	ItemNotfound  = errors.New("Item not found")
	ItemDontEquip = errors.New("Item cant be put on")
	ItemFailSlot1 = errors.New("Item fail slot 1")
	ItemFailSlot2 = errors.New("Item fail slot 2")
	ItemIsNil     = errors.New("Item is nil")
)

type Inventory struct {
	Inventory []*Item
	Equip     map[string]*Item
	inv_mutex sync.Mutex
}

func NewInventory() *Inventory {
	return &Inventory{
		Inventory: []*Item{},
		Equip:     make(map[string]*Item),
	}
}

func (inv *Inventory) addItem(item *Item) { inv.Inventory = append(inv.Inventory, item) }
func (inv *Inventory) removeItem(index int) {
	inv.Inventory = append(inv.Inventory[:index], inv.Inventory[index+1:]...)
}

func (inv *Inventory) EquipItem(index int) error {
	defer inv.inv_mutex.Unlock()
	inv.inv_mutex.Lock()

	if index >= len(inv.Inventory) {
		return ItemNotfound
	}

	item := inv.Inventory[index]

	if item == nil {
		return ItemIsNil
	}

	if item.Slot1 == "" && item.Slot2 == "" {
		return ItemDontEquip
	}

	if item.Dual {
		if slot, ok := inv.Equip[item.Slot1]; ok {
			inv.addItem(slot)
		}
		if slot, ok := inv.Equip[item.Slot2]; ok {
			inv.addItem(slot)
		}
		inv.Equip[item.Slot1] = item
		inv.Equip[item.Slot2] = item
	} else {
		slot1, ok1 := inv.Equip[item.Slot1]
		slot2, ok2 := inv.Equip[item.Slot2]
		switch {
		case ok1 && ok2:
			inv.addItem(slot1)
			if slot1 != slot2 {
				inv.addItem(slot2)
			}
			inv.Equip[item.Slot1] = item
			delete(inv.Equip, item.Slot2)
		case ok1:
			if item.Slot1 == "" {
				return ItemFailSlot1
			}
			inv.addItem(slot1)
			inv.Equip[item.Slot1] = item
		case ok2:
			if item.Slot2 == "" {
				return ItemFailSlot2
			}
			inv.addItem(slot2)
			inv.Equip[item.Slot2] = item
		default:
			inv.Equip[item.Slot1] = item
		}
	}

	inv.removeItem(index)

	return nil
}

func (inv *Inventory) UnequipItem(slot string) error {
	defer inv.inv_mutex.Unlock()
	inv.inv_mutex.Lock()

	item, ok := inv.Equip[slot]
	if !ok {
		return ItemNotfound
	}
	if item.Dual {
		delete(inv.Equip, item.Slot1)
		delete(inv.Equip, item.Slot2)
	} else {
		delete(inv.Equip, slot)
	}
	inv.addItem(item)
	return nil
}

func (inv *Inventory) RemoveItem(index int) {
	defer inv.inv_mutex.Unlock()
	inv.inv_mutex.Lock()
	inv.removeItem(index)
}

func (inv *Inventory) AddItem(item *Item) {
	defer inv.inv_mutex.Unlock()
	inv.inv_mutex.Lock()
	inv.addItem(item)
}
