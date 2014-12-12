package items

import (
	"gopkg.in/yaml.v2"
	"io/ioutil"
	. "oniproject/oni/artemis"
	"path"
)

type InventorySystem struct {
	cacheOfItemsData map[string]Item
	*BaseSystem
}

func NewInventorySystem() (sys *InventorySystem) {
	sys = &InventorySystem{
		cacheOfItemsData: make(map[string]Item),
	}
	sys.BaseSystem = NewBaseSystem(NewAspectFor((*InventoryComponent)(nil)), sys)
	return
}

func (sys *InventorySystem) ProcessEntities(entities []Entity) {}
func (sys *InventorySystem) CheckProcessing() bool             { return false }
func (sys *InventorySystem) Inserted(e Entity)                 {}
func (sys *InventorySystem) Removed(e Entity)                  {}

// TODO func (sys *InventorySystem) TransferItem(from, to Entity) {}

func (sys *InventorySystem) AddItem(e Entity, name string, x, y int) (item Item, err error) {
	inv := e.ComponentByType(INVENTORY).(*InventoryComponent)

	other, err := inv.Get(x, y)
	switch err {
	case ItemNotfound:
		// pass
	case nil:
		x, y, ok := sys.findFreeInv(inv)
		if !ok {
			err = InventoryFull
			return
		}
		inv.Inventory[y][x] = other
	default:
		return
	}

	item, err = sys.loadItem(name)
	if err != nil {
		return
	}
	inv.Inventory[y][x] = name

	return
}

func (sys *InventorySystem) RemoveItem(e Entity, x, y int) (item Item, err error) {
	inv, _, item, err := sys.getItem(e, x, y)
	if err != nil {
		return
	}

	inv.Inventory[y][x] = ""

	return
}

func (sys *InventorySystem) EquipItem(e Entity, x, y int) (item Item, err error) {
	inv, name, item, err := sys.getItem(e, x, y)
	if err != nil {
		return
	}

	if inv.EquipLocks[item.Slot] {
		err = EqupSlotLocked
	}

	slot := inv.Equip[item.Slot]
	lock := inv.Equip[item.Lock]

	if slot != "" || lock != "" {
		err = EquipSlotFull
		return
	}

	_, err = sys.RemoveItem(e, x, y)

	inv.Equip[item.Slot] = name
	inv.EquipLocks[item.Lock] = true

	return
}

func (sys *InventorySystem) UnequipItem(e Entity, slot string) (item Item, err error) {
	inv := e.ComponentByType(INVENTORY).(*InventoryComponent)

	name := inv.Equip[slot]
	if name == "" {
		err = ItemNotfound
		return
	}

	x, y, ok := sys.findFreeInv(inv)
	if !ok {
		err = InventoryFull
		return
	}

	item, err = sys.AddItem(e, name, x, y)
	if err == nil {
		inv.Equip[item.Slot] = ""
		inv.EquipLocks[item.Lock] = false
	}

	return
}

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

func (sys *InventorySystem) findFreeInv(inv *InventoryComponent) (x, y int, ok bool) {
	for ; y < inv.Height(); y++ {
		for ; x < inv.Width(); x++ {
			item := inv.Inventory[y][x]
			if item == "" {
				ok = true
				return
			}
		}
	}
	return
}
