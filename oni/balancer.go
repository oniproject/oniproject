package oni

// todo mutex for avatars

import (
	"errors"
	"github.com/gocircuit/circuit/client"
	"oniproject/oni/game"
	"oniproject/oni/utils"
)

type Balancer struct {
	c     *client.Client
	Maps  map[utils.Id]BalancerMap
	Game  *game.Game
	games []BalancerGame
	adb   AvatarDB
}

type BalancerMap struct {
	Max     int
	Avatars map[utils.Id]bool
}

type BalancerGame struct {
	Addr         string
	Rpc          string
	Minid, Maxid int64
}

func NewBalancer(config *Config, adb AvatarDB) (b *Balancer) {
	b = &Balancer{
		Maps:  make(map[utils.Id]BalancerMap),
		Game:  game.NewGame(config, adb),
		adb:   adb,
		games: config.Games,
	}
	if config.Circuit != "" {
		b.c = client.Dial(config.Circuit, nil)
	}
	return
}

func (b *Balancer) AttachAvatar(id utils.Id) (host string, mapId int64, a *game.Avatar, err error) {
	a, err = b.adb.AvatarById(id)
	if err != nil {
		a = nil
		return
	}

	m, ok := b.Maps[utils.Id(a.MapId)]
	if !ok {
		b.Game.LoadMap(utils.Id(a.MapId))
		m = BalancerMap{
			Max:     2000,
			Avatars: make(map[utils.Id]bool),
		}
		b.Maps[utils.Id(a.MapId)] = m
	}

	if len(m.Avatars) == m.Max {
		err = errors.New("fail attach: Map is full")
		return
	}

	if _, ok := m.Avatars[a.Id()]; ok {
		// avatar is avilable
		// unload it!
		// send disconnect rpc call to Game
		err = errors.New("fail attach: avatar is avilable")
		return
	}

	m.Avatars[a.Id()] = true
	host = b.games[0].Addr
	mapId = a.MapId

	// attach

	return
}

func (b *Balancer) DetachAvatar(a *game.Avatar) error {
	if m, ok := b.Maps[utils.Id(a.MapId)]; ok {
		if _, ok := m.Avatars[a.Id()]; ok {
			delete(m.Avatars, a.Id())
			// TODO send it to Game
		}
	}
	return nil
}
