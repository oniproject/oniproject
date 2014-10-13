package game

import (
	log "github.com/Sirupsen/logrus"
	"oniproject/oni/utils"
	"time"
)

type Dropper interface {
	DropItem(float64, float64, *Item)
}
type Pickuper interface {
	PickupItem(utils.Id) *Item
}

type DroppedItem struct {
	PositionComponent
	StateComponent
	Parameters

	Item *Item

	//Target utils.Id
	id utils.Id
}

func NewDroppedItem(x, y float64, item *Item) *DroppedItem {
	return &DroppedItem{
		PositionComponent: NewPositionComponent(x, y),
		Item:              item,
	}
}

func (item DroppedItem) Lag() time.Duration { return 0 }
func (item DroppedItem) Id() utils.Id       { return item.id }
func (item DroppedItem) Race() int          { return 0 }

func (item *DroppedItem) GetState(typ uint8, tick uint) *GameObjectState {
	return &GameObjectState{typ, item.id, tick, 0, item.position, item.veloctity}
}

func (item *DroppedItem) Update(w Walkabler, tick uint, t time.Duration) *GameObjectState {
	return item.GetState(STATE_IDLE, tick)
}

func (item *DroppedItem) AddState(name string) {
	log.Panic("AddState to DroppedItem ", item)
}
func (item *DroppedItem) RemoveState(name string) {
	log.Panic("RemoveState to DroppedItem ", item)
}
