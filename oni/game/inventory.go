package game

// TODO sync
// TODO check item parameters (maybe in message?)

import (
	"errors"
	. "oniproject/oni/artemis"
)

var (
	INVENTORY = GetIndexFor((*InventoryComponent)(nil))

	ItemNotfound  = errors.New("Item not found")
	ItemDontEquip = errors.New("Item cant be put on")
	ItemFailSlot1 = errors.New("Item fail slot 1")
	ItemFailSlot2 = errors.New("Item fail slot 2")
	ItemIsNil     = errors.New("Item is nil")
)

type InventoryComponent struct {
	Inventory []*Item
	Equip     map[string]*Item
}

func NewInventoryComponent() InventoryComponent {
	return InventoryComponent{
		Inventory: []*Item{},
		Equip:     make(map[string]*Item),
	}
}

func (inv *InventoryComponent) Name() string { return "inv" }

func (inv *InventoryComponent) AddItem(item *Item) { inv.Inventory = append(inv.Inventory, item) }
func (inv *InventoryComponent) RemoveItem(index int) {
	inv.Inventory = append(inv.Inventory[:index], inv.Inventory[index+1:]...)
}

func (inv *InventoryComponent) EquipItem(index int) error {
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
			inv.AddItem(slot)
		}
		if slot, ok := inv.Equip[item.Slot2]; ok {
			inv.AddItem(slot)
		}
		inv.Equip[item.Slot1] = item
		inv.Equip[item.Slot2] = item
	} else {
		slot1, ok1 := inv.Equip[item.Slot1]
		slot2, ok2 := inv.Equip[item.Slot2]
		switch {
		case ok1 && ok2:
			inv.AddItem(slot1)
			if slot1 != slot2 {
				inv.AddItem(slot2)
			}
			inv.Equip[item.Slot1] = item
			delete(inv.Equip, item.Slot2)
		case ok1:
			if item.Slot1 == "" {
				return ItemFailSlot1
			}
			inv.AddItem(slot1)
			inv.Equip[item.Slot1] = item
		case ok2:
			if item.Slot2 == "" {
				return ItemFailSlot2
			}
			inv.AddItem(slot2)
			inv.Equip[item.Slot2] = item
		default:
			inv.Equip[item.Slot1] = item
		}
	}

	inv.RemoveItem(index)

	return nil
}

func (inv *InventoryComponent) UnequipItem(slot string) error {
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
	inv.AddItem(item)
	return nil
}

type InventorySystem struct {
	*BaseSystem
}

func NewInventorySystem() (sys *InventorySystem) {
	sys = &InventorySystem{}
	sys.BaseSystem = NewBaseSystem(NewAspectFor((*InventoryComponent)(nil)), sys)
	return
}

func (sys *InventorySystem) ProcessEntities(entities []Entity) {}
func (sys *InventorySystem) CheckProcessing() bool             { return false }
func (sys *InventorySystem) Inserted(e Entity)                 {}
func (sys *InventorySystem) Removed(e Entity)                  {}

func (sys *InventorySystem) EquipItem(inv *InventoryComponent, item Item)         {}
func (sys *InventorySystem) TransferItem(from, to *InventoryComponent, item Item) {}
