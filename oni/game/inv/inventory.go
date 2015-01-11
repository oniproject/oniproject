package inv

// TODO sync
// TODO check item parameters (maybe in message?)

import "errors"

var (
	InventoryFull     = errors.New("Inventory full")
	InventoryBadPlace = errors.New("Inventory bad x,y position")
	ItemNotfound      = errors.New("Item not found")
	EquipSlotFull     = errors.New("Equip slot full")
	EqupSlotLocked    = errors.New("Equip slot locked")

	SlotNotFound = errors.New("Equip slot not found")
	SlotLocked   = errors.New("Equip slot is locked")
)

type Slot struct {
	Item   string
	Locked bool
}

type Inventory [][]string

func (inv *Inventory) Height() int { return len(*inv) }
func (inv *Inventory) Width() int  { return len((*inv)[0]) }
func (inv *Inventory) Get(x, y int) (string, error) {
	if x < 0 || x >= inv.Width() || y < 0 || y >= inv.Height() {
		return "", InventoryBadPlace
	}

	return (*inv)[y][x], nil
}

func (inv *Inventory) Add(name string, x, y int) (err error) {
	other, err := inv.Get(x, y)
	if err != nil {
		return
	}
	if other != "" {
		// move found item to another place
		x, y, ok := inv.FindFree()
		if !ok {
			err = InventoryFull
			return
		}
		(*inv)[y][x] = other
	}
	(*inv)[y][x] = name
	return
}

func (inv *Inventory) Remove(x, y int) (name string, err error) {
	name, err = inv.Get(x, y)
	if err == nil {
		(*inv)[y][x] = ""
	}
	return
}

func (inv *Inventory) FindFree() (x, y int, ok bool) {
	w, h := inv.Width(), inv.Height()
	for ; y < h; y++ {
		for x = 0; x < w; x++ {
			item := (*inv)[y][x]
			if item == "" {
				ok = true
				return
			}
		}
	}
	return
}

type InventoryComponent struct {
	Inventory Inventory
	Equip     map[string]*Slot
	Money     int
}

func NewInventoryComponent(width, height int, slots []string) InventoryComponent {
	inv := make([][]string, height)
	all := make([]string, width*height)
	for i := range inv {
		inv[i], all = all[:width], all[width:]
	}

	equip := make(map[string]*Slot)
	for _, slot := range slots {
		equip[slot] = &Slot{"", false}
	}

	return InventoryComponent{inv, equip, 0}
}

func (inv *InventoryComponent) Height() int { return inv.Inventory.Height() }
func (inv *InventoryComponent) Width() int  { return inv.Inventory.Width() }
func (inv *InventoryComponent) GetItem(x, y int) (string, error) {
	return inv.Inventory.Get(x, y)
}
func (inv *InventoryComponent) AddItem(name string, x, y int) (err error) {
	return inv.Inventory.Add(name, x, y)
}

func (inv *InventoryComponent) RemoveItem(x, y int) (name string, err error) {
	return inv.Inventory.Remove(x, y)
}

// TODO func (sys *InventorySystem) TransferItem(from, to Entity) {}

func (inv *InventoryComponent) EquipItem(x, y int) (err error) {
	name, err := inv.GetItem(x, y)

	if err != nil {
		return
	}
	if name == "" {
		return ItemNotfound
	}

	item, err := ItemByName(name)
	if err != nil {
		return
	}

	slot, ok := inv.Equip[item.Slot]
	if !ok {
		return SlotNotFound
	}
	if slot.Locked {
		return SlotLocked
	}

	if slot.Item != "" {
		inv.UnequipItem(item.Slot)
	}

	inv.RemoveItem(x, y)

	inv.Equip[item.Slot] = &Slot{name, false}
	if item.Lock != "" {
		inv.UnequipItem(item.Lock)
		inv.Equip[item.Lock] = &Slot{"", true}
	}

	return
}

func (inv *InventoryComponent) UnequipItem(name string) (err error) {
	slot, ok := inv.Equip[name]
	if !ok {
		return SlotNotFound
	}

	if slot.Item == "" {
		return
	}

	item, err := ItemByName(slot.Item)
	if err != nil {
		return
	}

	err = inv.AddItem(slot.Item, 0, 0)
	if err != nil {
		return
	}

	if item.Lock != "" {
		inv.Equip[item.Lock].Locked = false
	}
	inv.Equip[name] = &Slot{"", false}

	return
}
