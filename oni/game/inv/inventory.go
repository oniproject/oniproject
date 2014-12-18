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
type DataInvPos struct {
	X, Y int
	Item *Item
}
type DataSlot struct {
	Item   *Item
	Locked bool
}

type InventoryComponent struct {
	Inventory [][]string
	Equip     map[string]*Slot
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

	return InventoryComponent{inv, equip}
}

func (inv *InventoryComponent) Height() int { return len(inv.Inventory) }
func (inv *InventoryComponent) Width() int  { return len(inv.Inventory[0]) }

func (inv *InventoryComponent) GetInventory() (items []DataInvPos) {
	for y, line := range inv.Inventory {
		for x, item := range line {
			s := DataInvPos{x, y, nil}
			i, err := ItemByName(item)
			if err == nil {
				s.Item = i
			}
			items = append(items, s)
		}
	}
	return
}

func (inv *InventoryComponent) GetEquip() (equip map[string]DataSlot) {
	equip = make(map[string]DataSlot)
	for k, v := range inv.Equip {
		s := DataSlot{Locked: v.Locked}
		i, err := ItemByName(v.Item)
		if err == nil {
			s.Item = i
		}
		equip[k] = s
	}
	return
}

func (inv *InventoryComponent) GetItem(x, y int) (string, error) {
	if x < 0 || x >= inv.Width() || y < 0 || y >= inv.Height() {
		return "", InventoryBadPlace
	}

	return inv.Inventory[y][x], nil
}

func (inv *InventoryComponent) AddItem(name string, x, y int) (err error) {
	other, err := inv.GetItem(x, y)
	if err != nil {
		return
	}
	if other != "" {
		// move found item to another place
		x, y, ok := inv.findFree()
		if !ok {
			err = InventoryFull
			return
		}
		inv.Inventory[y][x] = other
	}

	inv.Inventory[y][x] = name
	return
}

func (inv *InventoryComponent) RemoveItem(x, y int) (name string, err error) {
	name, err = inv.GetItem(x, y)
	if err == nil {
		inv.Inventory[y][x] = ""
	}
	return
}

func (inv *InventoryComponent) findFree() (x, y int, ok bool) {
	w, h := inv.Width(), inv.Height()
	for ; y < h; y++ {
		for x = 0; x < w; x++ {
			item := inv.Inventory[y][x]
			if item == "" {
				ok = true
				return
			}
		}
	}
	return
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
	//
	/*
		if slot.Item == "" {
			return
		}

		x, y, ok := inv.findFree()
		if !ok {
			err = InventoryFull
			return
		}

		item, err = sys.AddItem(e, name, x, y)
		if err == nil {
			inv.Equip[item.Slot] = ""
			inv.EquipLocks[item.Lock] = false
		}
	*/

	return
}

/*
func (sys *InventorySystem) getItem(e Entity, x, y int) (inv *InventoryComponent, name string, item Item, err error) {
	inv = e.ComponentByType(INVENTORY).(*InventoryComponent)

	if x >= inv.Width() || y >= inv.Height() {
		err = InventoryBadPlace
		return
	}

	name = inv.Inventory[y][x]
	if name == "" {
		err = ItemNotfound
		return
	}
	item, err = sys.loadItem(name)

	return
}

func (sys *InventorySystem) loadItem(name string) (item Item, err error) {
	item, ok := sys.cacheOfItemsData[name]
	if ok {
		return
	}

	fname := path.Join(ITEM_PATH, name+".yml")

	file, err := ioutil.ReadFile(fname)
	if err != nil {
		return
	}

	err = yaml.Unmarshal(file, &item)
	if err != nil {
		return
	}

	sys.cacheOfItemsData[name] = item

	return
}

/*

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
}*/
