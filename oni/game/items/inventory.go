package items

// TODO check item parameters (maybe in message?)

import (
	"errors"
	. "oniproject/oni/artemis"
)

var (
	INVENTORY = GetIndexFor((*InventoryComponent)(nil))

	InventoryFull     = errors.New("Inventory full")
	InventoryBadPlace = errors.New("Inventory bad x,y position")
	ItemNotfound      = errors.New("Item not found")
	EquipSlotFull     = errors.New("Equip slot full")
	EqupSlotLocked    = errors.New("Equip slot locked")

/*
	ItemDontEquip = errors.New("Item cant be put on")
	ItemFailSlot1 = errors.New("Item fail slot 1")
	ItemFailSlot2 = errors.New("Item fail slot 2")
	ItemIsNil     = errors.New("Item is nil")
*/
)

type InventoryComponent struct {
	Inventory  [][]string
	Equip      map[string]string
	EquipLocks map[string]bool
}

func NewInventoryComponent(width, height int, slots []string) *InventoryComponent {
	inv := make([][]string, height)
	all := make([]string, width*height)
	for i := range inv {
		inv[i], all = all[:width], all[width:]
	}

	equip := make(map[string]string)
	equipLock := make(map[string]bool)
	for _, slot := range slots {
		equip[slot] = ""
		equipLock[slot] = false
	}

	return &InventoryComponent{inv, equip, equipLock}
}

func (inv *InventoryComponent) Name() string { return "inv" }

func (inv *InventoryComponent) Height() int { return len(inv.Inventory) }
func (inv *InventoryComponent) Width() int  { return len(inv.Inventory[0]) }

func (inv *InventoryComponent) Get(x, y int) (name string, err error) {
	if x < 0 || x >= inv.Width() || y < 0 || y >= inv.Height() {
		err = InventoryBadPlace
		return
	}

	name = inv.Inventory[y][x]
	if name == "" {
		err = ItemNotfound
	}

	return
}
