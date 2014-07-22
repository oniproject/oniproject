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
}

type BalancerMap struct {
	Max     int
	Avatars map[Id]bool
}

func NewBalancer(circuit string) (b *Balancer) {
	b = &Balancer{
		Maps: make(map[Id]BalancerMap),
		Game: NewGame(),
	}
	b.Game.Addr = ":2000"
	if circuit != "" {
		b.c = client.Dial(circuit, nil)
	}
	return
}

func (b *Balancer) AttachAvatar(a AvatarData) error {
	m, ok := b.Maps[a.MapId]
	if !ok {
		// load map
		return errors.New("fail load map")
	}

	if len(m.Avatars) == m.Max {
		return errors.New("fail attach: Map is full")
	}

	if _, ok := m.Avatars[a.Id]; ok {
		// avatar is avilable
		// unload it!
		// send disconnect rpc call to Game
		return errors.New("fail attach: avatar is avilable")
	}

	m.Avatars[a.Id] = true

	// attach

	return nil
}

func (b *Balancer) DetachAvatar(a AvatarData) error {
	if m, ok := b.Maps[a.MapId]; ok {
		if _, ok := m.Avatars[a.Id]; ok {
			delete(m.Avatars, a.Id)
			// TODO send it to Game
		}
	}
	return nil
}
