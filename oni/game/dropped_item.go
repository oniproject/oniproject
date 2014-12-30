package game

import (
	log "github.com/Sirupsen/logrus"
	. "oniproject/oni/game/inv"
	"oniproject/oni/utils"
)

type Dropper interface {
	DropItem(float64, float64, string)
}

type DroppedItem struct {
	*Map

	PositionComponent
	StateComponent
	Parameters

	Item string
	name string

	id utils.Id
}

func NewDroppedItem(x, y float64, item string, m *Map) (ii *DroppedItem) {
	i, _ := ItemByName(item)
	ii = &DroppedItem{
		Map:  m,
		Item: item,
		name: i.Name,
	}
	ii.SetPosition(x, y)
	return
}

func (item DroppedItem) Name() string { return item.name }
func (item DroppedItem) Id() utils.Id { return item.id }

func (item *DroppedItem) AddState(name string) {
	log.Panic("AddState to DroppedItem ", item)
}
func (item *DroppedItem) RemoveState(name string) {
	log.Panic("RemoveState to DroppedItem ", item)
}
