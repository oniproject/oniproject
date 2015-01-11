package game

import (
	//log "github.com/Sirupsen/logrus"
	"github.com/oniproject/geom"
	"oniproject/oni/utils"
	"sync"
)

type Replicator struct {
	tree *utils.Tree

	watchers map[*Avatar]bool

	all, added, removed, updated GameObjectSet

	distance  float64
	distance2 float64
	tick      uint
	sync.Mutex
}

func NewReplicator(replicRange float64, w, h float64) *Replicator {
	return &Replicator{
		distance:  replicRange,
		distance2: replicRange * replicRange,
		watchers:  make(map[*Avatar]bool),
		all:       NewGameObjectSet(),
		added:     NewGameObjectSet(),
		removed:   NewGameObjectSet(),
		updated:   NewGameObjectSet(),
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

	r.added.Add(obj)

	if avatar, ok := obj.(*Avatar); ok {
		r.watchers[avatar] = true
	}
	r.all.Add(obj)

	r.removed.Remove(obj)
	r.updated.Remove(obj)

	r.tree.Insert(obj)
}

func (r *Replicator) Remove(obj GameObject) {
	r.Lock()
	defer r.Unlock()

	r.removed.Add(obj)

	if avatar, ok := obj.(*Avatar); ok {
		delete(r.watchers, avatar)
	}

	r.all.Remove(obj)
	r.added.Remove(obj)
	r.updated.Remove(obj)

	r.tree.Remove(obj)
}

func (r *Replicator) Update(obj GameObject) {
	r.Lock()
	defer r.Unlock()

	if _, ok := r.removed[obj]; !ok {
		r.updated.Add(obj)
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
		r.processWatcher(watcher)
	}

	r.added.Clear()
	r.removed.Clear()
	r.updated.Clear()
}

func (r *Replicator) processWatcher(watcher *Avatar) {
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

					ok := r.updated.Contains(other)
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

func (r *Replicator) checkPos(a, b GameObject) bool {
	return r.distance2 >= a.Position().DistanceFromSquared(b.Position())
}
func (r *Replicator) checkOld(a, b GameObject) bool {
	return r.distance2 >= a.LastPosition().DistanceFromSquared(b.LastPosition())
}
