package game

import (
	log "github.com/Sirupsen/logrus"
	"github.com/oniproject/geom"
	"oniproject/oni/utils"
	"time"
)

type ReplicaMsg struct {
	Tick    uint
	Added   []*AddMsg
	Removed []utils.Id
	Updated []*UpdateMsg
}

func (m *ReplicaMsg) ADD(obj GameObject) {
	msg := &AddMsg{
		//Tick:     r.tick,
		Type:     STATE_IDLE,
		Name:     obj.Name(),
		Id:       obj.Id(),
		Position: obj.Position(),
		Velocity: obj.Velocity(),
	}
	if msg.Velocity.X != 0 || msg.Velocity.Y != 0 {
		msg.Type = STATE_MOVE
	}
	if avatar, ok := obj.(*Avatar); ok {
		msg.Lag = avatar.Lag()
		msg.Type = avatar.state
		msg.IsAvatar = true
	}

	_, msg.IsItem = obj.(*DroppedItem)
	_, msg.IsMonster = obj.(*Monster)

	msg.HP, msg.MHP = obj.HPbar()
	m.Added = append(m.Added, msg)
}

func (m *ReplicaMsg) RM(obj GameObject) {
	m.Removed = append(m.Removed, obj.Id())
}
func (m *ReplicaMsg) UPD(obj GameObject) {
	msg := &UpdateMsg{
		Type:     STATE_IDLE,
		Id:       obj.Id(),
		Position: obj.Position(),
		Velocity: obj.Velocity(),
	}
	if msg.Velocity.X != 0 || msg.Velocity.Y != 0 {
		msg.Type = STATE_MOVE
	}
	if avatar, ok := obj.(*Avatar); ok {
		msg.Lag = avatar.Lag()
		msg.Type = avatar.state
	}
	msg.HP, msg.MHP = obj.HPbar()
	m.Updated = append(m.Updated, msg)
}

type AddMsg struct {
	//Tick     uint
	Type      uint8
	IsAvatar  bool
	IsItem    bool
	IsMonster bool
	Name      string
	Id        utils.Id
	Lag       time.Duration
	Position  geom.Coord
	Velocity  geom.Coord
	HP, MHP   int
	// TODO
}

//type RemoveMsg struct {
//Tick uint
//Id   utils.Id
//}

type UpdateMsg struct {
	//Tick     uint
	Type     uint8
	Id       utils.Id
	Lag      time.Duration
	Position geom.Coord
	Velocity geom.Coord
	HP, MHP  int
	// TODO
}

func (m *ReplicaMsg) Run(GameObject) { log.Panic("run") }
