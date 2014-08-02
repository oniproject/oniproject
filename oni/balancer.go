package oni

// todo mutex for avatars

import (
	"errors"
	"github.com/gocircuit/circuit/client"
)

type Balancer struct {
	c    *client.Client
	Maps map[Id]BalancerMap
	Game *Game
	db   *Database
}

type BalancerMap struct {
	Max     int
	Avatars map[Id]bool
}

func NewBalancer(circuit string, db *Database) (b *Balancer) {
	b = &Balancer{
		Maps: make(map[Id]BalancerMap),
		Game: NewGame(),
		db:   db,
	}
	b.Game.Addr = ":2000"
	if circuit != "" {
		b.c = client.Dial(circuit, nil)
	}
	return
}

func (b *Balancer) AttachAvatar(id Id) (a *AvatarData, err error) {
	a, err = b.db.AvatarDataById(id)
	if err != nil {
		a = nil
		return
	}

	m, ok := b.Maps[Id(a.MapId)]
	if !ok {
		// load map
		err = errors.New("fail load map")
		return
	}

	if len(m.Avatars) == m.Max {
		err = errors.New("fail attach: Map is full")
		return
	}

	if _, ok := m.Avatars[Id(a.Id)]; ok {
		// avatar is avilable
		// unload it!
		// send disconnect rpc call to Game
		err = errors.New("fail attach: avatar is avilable")
		return
	}

	m.Avatars[Id(a.Id)] = true

	// attach

	return
}

func (b *Balancer) DetachAvatar(a AvatarData) error {
	if m, ok := b.Maps[Id(a.MapId)]; ok {
		if _, ok := m.Avatars[Id(a.Id)]; ok {
			delete(m.Avatars, Id(a.Id))
			// TODO send it to Game
		}
	}
	return nil
}
