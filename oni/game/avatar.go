package game

import (
	"encoding/json"
	"fmt"
	log "github.com/Sirupsen/logrus"
	"oniproject/oni/utils"
	"time"
)

type AvatarMapper interface {
	Walkable(int, int) bool
	Unregister(*Avatar)
	Send(utils.Id, Message)
	GetObjById(utils.Id) GameObject
}

type Avatar struct {
	AvatarId int64 `gorm:"column:id; primary_key:yes"`

	Nickname string
	ClassId  int
	RaceId   int
	MapId    int64
	X, Y     float64

	PositionComponent     `sql:"-"`
	PositionComponentJson []byte
	Parameters            `sql:"-"`
	ParametersJson        []byte
	Inventory             `sql:"-"`
	InventoryJson         []byte
	AvatarConnection      `sql:"-"`

	Target utils.Id     `sql:"-"`
	game   AvatarMapper `sql:"-"`
}

func NewAvatar() *Avatar {
	return &Avatar{
		Inventory: NewInventory(),
	}
}

func (a *Avatar) String() string {
	return fmt.Sprintf(`Avatar[%d]'%s' pos[%f:%f] pc:%s param:%s inv:%s`,
		a.AvatarId, a.Nickname, a.X, a.Y,
		string(a.PositionComponentJson), string(a.ParametersJson), string(a.InventoryJson))
}

func (a *Avatar) BeforeSave() (err error) {
	a.X, a.Y = a.position.X, a.position.Y

	a.ParametersJson, err = json.Marshal(&(a.Parameters))
	if err != nil {
		log.Error("BeforeSave", err)
		return
	}
	a.PositionComponentJson, err = json.Marshal(&(a.PositionComponent))
	if err != nil {
		log.Error("BeforeSave", err)
		return
	}
	a.InventoryJson, err = json.Marshal(&(a.Inventory))
	if err != nil {
		log.Error("BeforeSave", err)
		return
	}
	return
}
func (a *Avatar) AfterFind() (err error) {
	a.position.X, a.position.Y = a.X, a.Y

	err = json.Unmarshal(a.ParametersJson, &(a.Parameters))
	if err != nil {
		log.Errorf("AfterFind Parameters %s '%s'", err, string(a.ParametersJson))
		return
	}
	err = json.Unmarshal(a.PositionComponentJson, &(a.PositionComponent))
	if err != nil {
		log.Errorf("AfterFind PositionComponent %s '%s'", err, string(a.PositionComponentJson))
		return
	}
	err = json.Unmarshal(a.InventoryJson, &(a.Inventory))
	if err != nil {
		log.Errorf("AfterFind InventoryJson %s '%s'", err, string(a.InventoryJson))
		return
	}

	return
}

func (a Avatar) Id() utils.Id {
	return utils.Id(a.AvatarId)
}

func (a *Avatar) Send(m Message) {
	m.Run(a)
}

func (a Avatar) GetState(typ uint8, tick uint) *GameObjectState {
	return &GameObjectState{typ, utils.Id(a.AvatarId), tick, a.Lag, a.Position(), a.Velocity()}
}

func (a *Avatar) Update(tick uint, t time.Duration) (state *GameObjectState) {
	if a.PositionComponent.Update(a.game, t) {
		return a.GetState(STATE_MOVE, tick)
	} else {
		return a.GetState(STATE_IDLE, tick)
	}
}
