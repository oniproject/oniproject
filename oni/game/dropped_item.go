package game

import (
	log "github.com/Sirupsen/logrus"
	. "oniproject/oni/artemis"
	. "oniproject/oni/utils"
	"time"
)

type Dropper interface {
	DropItem(float64, float64, *Item)
}
type Pickuper interface {
	PickupItem(Id) *Item
}

type DroppedItem struct {
	PositionComponent
	StateComponent
	Parameters

	Item *Item

	id Id

	Entity
}

func NewDroppedItem(x, y float64, item *Item) *DroppedItem {
	return &DroppedItem{
		PositionComponent: NewPositionComponent(x, y),
		Item:              item,
	}
}
func (item DroppedItem) GetPositionComponent() *PositionComponent {
	return &item.PositionComponent
}

func (item DroppedItem) Name() string       { return item.Item.Name }
func (item DroppedItem) Lag() time.Duration { return 0 }
func (item DroppedItem) UUID() Id           { return item.id }
func (item DroppedItem) Race() int          { return 0 }

func (item *DroppedItem) Update(w Walkabler, tick uint, t time.Duration) bool { return false }

func (item *DroppedItem) AddState(name string) {
	log.Panic("AddState to DroppedItem ", item)
}
func (item *DroppedItem) RemoveState(name string) {
	log.Panic("RemoveState to DroppedItem ", item)
}
