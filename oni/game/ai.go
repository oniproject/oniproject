package game

import (
	"github.com/oniproject/geom"
	"math/rand"
	"sync"
	"time"
)

type AI struct {
	monsters map[*Monster]bool
	sync.Mutex
}

func NewAI() *AI {
	return &AI{
		monsters: make(map[*Monster]bool),
	}
}

func (ai *AI) Add(obj GameObject) {
	ai.Lock()
	defer ai.Unlock()
	if m, ok := obj.(*Monster); ok {
		ai.monsters[m] = true
	}
}

func (ai *AI) Remove(obj GameObject) {
	ai.Lock()
	defer ai.Unlock()
	if m, ok := obj.(*Monster); ok {
		delete(ai.monsters, m)
	}
}

func (ai *AI) Run(quit chan struct{}) {
	t := time.NewTicker(1 * time.Second)
	defer t.Stop()

	for {
		select {
		case <-quit:
			quit = nil
			return
		case <-t.C:
			if quit == nil {
				continue
			}

			ai.Lock()
			for m := range ai.monsters {
				coord := geom.Coord{rand.Float64() - 0.5, rand.Float64() - 0.5}
				coord = coord.Unit().Times(8)
				m.Send(m.Id(), &SetVelocityMsg{coord.X, coord.Y})
			}
			ai.Unlock()
		}
	}
}
