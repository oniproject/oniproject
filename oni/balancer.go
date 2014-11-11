package oni

// todo mutex for avatars

import (
	log "github.com/Sirupsen/logrus"
	"net/rpc"
	"oniproject/oni/game"
	"oniproject/oni/utils"
)

type Balancer struct {
	games []*BalancerGame
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
	Maps         map[string]*BalancerMap
	client       *rpc.Client
}

func (g *BalancerGame) LoadMap(id string) error {
	reply := struct{}{}
	return g.client.Call("Game.LoadMap", &id, &reply)
}

func (g *BalancerGame) DetachAvatar(id utils.Id, mapId string) error {
	reply := struct{}{}
	return g.client.Call("Game.DetachAvatar", &game.DetachAvatarArgs{id, mapId}, &reply)
}

func NewBalancer(config *Config, adb AvatarDB) (b *Balancer) {
	b = &Balancer{
		adb:   adb,
		games: config.Games,
	}
	return
}

func (b *Balancer) AttachAvatar(id utils.Id) (host string, mapId string, a *game.Avatar, err error) {
	a, err = b.adb.AvatarById(id)
	if err != nil {
		a = nil
		return
	}

	m, game := b.findMap(a.MapId)

	if _, ok := m.Avatars[a.Id()]; ok {
		game.DetachAvatar(a.Id(), a.MapId)
	}

	m.Avatars[a.Id()] = true
	host = game.Addr
	mapId = a.MapId

	// attach

	return
}

/* TODO
func (b *Balancer) DetachAvatar(a *game.Avatar) error {
	if m, ok := b.Maps[utils.Id(a.MapId)]; ok {
		if _, ok := m.Avatars[a.Id()]; ok {
			delete(m.Avatars, a.Id())
			// TODO send it to Game
		}
	}
	return nil
}*/

//func (b *Balancer) AddGameClient(addr string) error {
//}

func (b *Balancer) findMap(id string) (*BalancerMap, *BalancerGame) {
	for _, g := range b.games {
		if m, ok := g.Maps[id]; ok {
			if len(m.Avatars) >= m.Max {
				log.Errorf("Map is full %v %v", m, g)
				continue
			}
			return m, g
		}
	}

	m := &BalancerMap{
		Max:     2000,
		Avatars: make(map[utils.Id]bool),
	}

	log.Info("create map ", id)

	// FIXME find free Map

	g := b.games[0]
	if g.client == nil {

		//for _, g := range config.Games {
		client, err := rpc.Dial("tcp", g.Rpc)
		if err != nil {
			log.Panic(err)
		}
		//}
		g.client = client
	}

	if g.Maps == nil {
		g.Maps = make(map[string]*BalancerMap)
	}

	g.Maps[id] = m
	g.LoadMap(id)

	return m, g
}
