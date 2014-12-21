package game

import (
	//log "github.com/Sirupsen/logrus"
	"github.com/oniproject/geom"
	"oniproject/oni/utils"
	"sync"
)

type Replicator struct {
	tree *utils.Tree

	all      map[GameObject]bool
	watchers map[*Avatar]bool

	added, removed, updated map[GameObject]bool

	distance  float64
	distance2 float64
	tick      uint
	sync.Mutex
}

func NewReplicator(replicRange float64, w, h float64) *Replicator {
	return &Replicator{
		distance:  replicRange,
		distance2: replicRange * replicRange,
		all:       make(map[GameObject]bool),
		watchers:  make(map[*Avatar]bool),
		added:     make(map[GameObject]bool),
		removed:   make(map[GameObject]bool),
		updated:   make(map[GameObject]bool),
		tree: utils.NewQTree(geom.Rect{
			geom.Coord{0, 0},
			geom.Coord{w, h},
		}, 10, 5),
	}
}

func (r *Replicator) ObjectsAround(center geom.Coord, radius float64) (objects []GameObject) {
	rect := geom.Rect{
		center.Minus(geom.Coord{radius, radius}),
		center.Plus(geom.Coord{radius, radius}),
	}
	for _, obj := range r.tree.Inside(rect) {
		d := center.DistanceFrom(obj.Position())
		if d <= radius {
			objects = append(objects, obj.(GameObject))
		}
	}
	return objects
}

func (r *Replicator) Add(obj GameObject) {
	r.Lock()
	defer r.Unlock()

	r.added[obj] = true

	if avatar, ok := obj.(*Avatar); ok {
		r.watchers[avatar] = true
	}
	r.all[obj] = true

	delete(r.removed, obj)
	delete(r.updated, obj)

	r.tree.Insert(obj)
}

func (r *Replicator) Remove(obj GameObject) {
	r.Lock()
	defer r.Unlock()

	r.removed[obj] = true

	if avatar, ok := obj.(*Avatar); ok {
		delete(r.watchers, avatar)
	}
	delete(r.all, obj)

	delete(r.added, obj)
	delete(r.updated, obj)

	r.tree.Remove(obj)
}

func (r *Replicator) Update(obj GameObject) {
	r.Lock()
	defer r.Unlock()

	if _, ok := r.removed[obj]; !ok {
		r.updated[obj] = true
	}
	r.tree.Remove(obj)
	r.tree.Insert(obj)
}

func (r *Replicator) Process() {
	r.Lock()
	defer r.Unlock()

	r.tick++

	// обработать все аватары
	for watcher := range r.watchers {
		replic := &ReplicaMsg{
			Tick: r.tick,
		}
		// отсылаем новые
		for obj := range r.added {
			// если это мы сами себя добавили
			if obj == watcher {
				// то отсылаем всё, что вокруг
				for other := range r.all {
					if r.checkPos(watcher, other) {
						replic.ADD(other)
					}
				}
				continue
			}

			// простая рассылка
			if r.checkPos(watcher, obj) {
				replic.ADD(obj)
			}
		}

		// отсылаем удаления
		for obj := range r.removed {
			if r.checkPos(watcher, obj) {
				replic.RM(obj)
			}
			// TODO а если мы себя удаляем? Авотхуй
		}

		for obj := range r.updated {
			now := r.checkPos(watcher, obj)
			old := r.checkOld(watcher, obj)
			switch {
			case now && !old:
				replic.ADD(obj)
			case !now && old:
				replic.RM(obj)
			case now && old:
				replic.UPD(obj)
				// если сами обновились
				if watcher == obj {
					for other := range r.all {
						if watcher == other {
							continue
						}

						_, ok := r.updated[other]
						now := r.checkPos(watcher, other)
						old := r.checkOld(watcher, other)

						switch {
						case now && !old && !ok:
							replic.ADD(other)
						case !now && old:
							replic.RM(other)
						}
					}
				}
			}
		}

		watcher.sendMessage <- replic
	}

	r.added = make(map[GameObject]bool)
	r.removed = make(map[GameObject]bool)
	r.updated = make(map[GameObject]bool)
}

func (r *Replicator) checkPos(a, b GameObject) bool {
	return r.distance2 >= a.Position().DistanceFromSquared(b.Position())
}
func (r *Replicator) checkOld(a, b GameObject) bool {
	return r.distance2 >= a.LastPosition().DistanceFromSquared(b.LastPosition())
}
