package game

import (
	"encoding/json"
	"fmt"
	log "github.com/Sirupsen/logrus"
	"oniproject/oni/utils"
	"time"
)

type Avatar struct {
	AvatarId int64 `gorm:"column:id; primary_key:yes"`

	Nickname string
	ClassId  int
	RaceId   int
	MapId    string
	X, Y     float64

	PositionComponent `sql:"-"`
	//PositionComponentJson  []byte
	Parameters             `sql:"-"`
	ParametersJson         []byte
	InventoryComponent     `sql:"-"`
	InventoryComponentJson []byte
	StateComponent         `sql:"-"`
	StateComponentJson     []byte
	SkillComponent         `sql:"-"`
	SkillComponentJson     []byte
	Soul                   `sql:"-"`
	SoulJson               []byte

	Connection `sql:"-"`

	Target utils.Id `sql:"-"`
}

func NewAvatar() *Avatar {
	a := &Avatar{
		InventoryComponent: NewInventoryComponent(),
		SkillComponent:     NewSkillComponent(),
		StateComponent:     NewStateComponent(),
	}
	return a
}

func (a Avatar) Name() string { return a.Nickname }
func (a Avatar) Id() utils.Id { return utils.Id(a.AvatarId) }
func (a Avatar) Race() int    { return 5 }

// for debug print
func (a *Avatar) String() string {
	return fmt.Sprintf(`Avatar[%d]'%s' pos[%f:%f] param:%s inv:%s`,
		a.AvatarId, a.Nickname, a.X, a.Y,
		string(a.ParametersJson), string(a.InventoryComponentJson))
}

func (a *Avatar) Update(w Walkabler, tick uint, t time.Duration) bool {
	return a.PositionComponent.Update(w, t)
}

// db hooks
func (a *Avatar) BeforeCreate() (err error) {
	a.position.X, a.position.Y = a.X, a.Y
	return a.marshal()
}
func (a *Avatar) BeforeUpdate() (err error) {
	a.X, a.Y = a.position.X, a.position.Y
	return a.marshal()
}
func (a *Avatar) AfterFind() (err error) {
	a.position.X, a.position.Y = a.X, a.Y
	err = a.unmarshal()
	return
}

func (a *Avatar) marshal() (err error) {
	a.ParametersJson, err = json.Marshal(&(a.Parameters))
	if err != nil {
		log.Error("BeforeSave ", err)
		return
	}
	/*a.PositionComponentJson, err = json.Marshal(&(a.PositionComponent))
	if err != nil {
		log.Error("BeforeSave ", err)
		return
	}*/
	a.InventoryComponentJson, err = json.Marshal(&(a.InventoryComponent))
	if err != nil {
		log.Error("BeforeSave ", err)
		return
	}
	a.SkillComponentJson, err = json.Marshal(&(a.SkillComponent))
	if err != nil {
		log.Error("BeforeSave ", err)
		return
	}
	a.StateComponentJson, err = json.Marshal(&(a.StateComponent))
	if err != nil {
		log.Error("BeforeSave ", err)
		return
	}
	a.SoulJson, err = json.Marshal(&(a.Soul))
	if err != nil {
		log.Error("BeforeSave ", err)
		return
	}
	return
}
func (a *Avatar) unmarshal() (err error) {
	err = json.Unmarshal(a.ParametersJson, &(a.Parameters))
	if err != nil {
		log.Errorf("AfterFind Parameters %s '%s'", err, string(a.ParametersJson))
		return
	}
	/*err = json.Unmarshal(a.PositionComponentJson, &(a.PositionComponent))
	if err != nil {
		log.Errorf("AfterFind PositionComponent %s '%s'", err, string(a.PositionComponentJson))
		return
	}*/
	err = json.Unmarshal(a.InventoryComponentJson, &(a.InventoryComponent))
	if err != nil {
		log.Errorf("AfterFind InventoryComponentJson %s '%s'", err, string(a.InventoryComponentJson))
		return
	}
	err = json.Unmarshal(a.SkillComponentJson, &(a.SkillComponent))
	if err != nil {
		log.Errorf("AfterFind SkillComponentJson %s '%s'", err, string(a.SkillComponentJson))
		return
	}
	err = json.Unmarshal(a.StateComponentJson, &(a.StateComponent))
	if err != nil {
		log.Errorf("AfterFind StateComponentJson %s '%s'", err, string(a.StateComponentJson))
		return
	}
	err = json.Unmarshal(a.SoulJson, &(a.Soul))
	if err != nil {
		log.Errorf("AfterFind Soul %s '%s'", err, string(a.SoulJson))
		return
	}
	return
}
