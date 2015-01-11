package game

import (
	log "github.com/Sirupsen/logrus"
	. "oniproject/oni/game/inv"
	"oniproject/oni/utils"
)

type DropItemMsg struct {
	Id int
}

func (m *DropItemMsg) Run(obj GameObject) {
	defer func() {
		if err := recover(); err != nil {
			log.Error("fail DropItemMsg: item notfound")
		}
	}()
	a := obj.(*Avatar)

	x := m.Id % a.InventoryComponent.Width()
	y := m.Id / a.InventoryComponent.Width()

	name, err := a.GetItem(x, y)
	if err != nil {
		return
	}

	a.RemoveItem(x, y)

	pos := a.Position()
	obj.DropItem(pos.X, pos.Y, name)

	SendInventory(a)
}

type PickupItemMsg struct {
	Target utils.Id `mapstructure:"t"`
}

func (m *PickupItemMsg) Run(obj GameObject) {
	a := obj.(*Avatar)
	if obj := obj.GetObjById(m.Target); obj != nil {
		if item, ok := obj.(*DroppedItem); ok {
			err := a.AddItem(item.Item, 0, 0)
			if err == nil {
				obj.Unregister(obj)

				SendInventory(a)
				return
			}
		}
	}

	log.Error("FAIL PickupItem")
	return
}

type RequestInventoryMsg struct{}

func (m *RequestInventoryMsg) Run(obj GameObject) {
	a := obj.(*Avatar)
	log.Debugf("RequestInventoryMsg %v %v", a.Inventory, a.Equip)
	SendInventory(a)
}

type InventoryMsg struct {
	Inventory []DataInvPos        `mapstructure:"inv"`
	Equip     map[string]DataSlot `mapstructure:"equip"`
	Money     int
}

func (m *InventoryMsg) Run(obj GameObject) { log.Panic("InventoryMsg Run") }

type DataInvPos struct {
	X, Y int
	Item *Item
}
type DataSlot struct {
	Item   *Item
	Locked bool
}

func SendInventory(avatar *Avatar) {
	items := []DataInvPos{}
	for y, line := range avatar.Inventory {
		for x, item := range line {
			s := DataInvPos{x, y, nil}
			i, err := ItemByName(item)
			if err == nil {
				s.Item = i
			}
			items = append(items, s)
		}
	}

	equip := make(map[string]DataSlot)
	for k, v := range avatar.Equip {
		s := DataSlot{Locked: v.Locked}
		i, err := ItemByName(v.Item)
		if err == nil {
			s.Item = i
		}
		equip[k] = s
	}

	avatar.sendMessage <- &InventoryMsg{items, equip, avatar.Money}
}
