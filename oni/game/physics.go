package game

import (
	"fmt"
	"github.com/oniproject/chipmunk.go"
	"github.com/oniproject/geom"
	"math"
	"runtime"
	"sync"
)

const (
	TIME_STEP     = 1.0 / 60.0
	OBJECT_RADIUS = 0.5
)

type Physics struct {
	*Map

	bodiesByObject map[GameObject]cp.Struct_SS_cpBody
	shapesByObject map[GameObject]cp.Struct_SS_cpShape

	static map[cp.Struct_SS_cpShape]bool

	space cp.Struct_SS_cpSpace
	sync.Mutex
}

func NewPhysic(m *Map, width, height float64) (p *Physics) {
	p = &Physics{
		Map:            m,
		space:          cp.SpaceNew(),
		bodiesByObject: make(map[GameObject]cp.Struct_SS_cpBody),
		shapesByObject: make(map[GameObject]cp.Struct_SS_cpShape),
		static:         make(map[cp.Struct_SS_cpShape]bool),
	}

	cp.SpaceSetGravity(p.space, cp.V(0, 0))

	p.AddStaticBox(0, 0, width, height)

	runtime.SetFinalizer(p, func(p *Physics) {
		for s := range p.static {
			cp.SpaceRemoveShape(p.space, s)
			cp.ShapeFree(s)
		}
		cp.SpaceFree(p.space)
		b := len(p.bodiesByObject)
		s := len(p.shapesByObject)
		if b != 0 || s != 0 {
			s := fmt.Errorf("remove *Physics with GameObject's %d %d", b, s)
			panic(s)
		}
	})
	return
}

func (p *Physics) Add(obj GameObject) {
	p.Lock()
	defer p.Unlock()
	p.add(obj)
}
func (p *Physics) Remove(obj GameObject) {
	p.Lock()
	defer p.Unlock()
	p.remove(obj)
}
func (p *Physics) Update(obj GameObject) {
	p.Lock()
	defer p.Unlock()
	p.update(obj)
}
func (p *Physics) SyncVelocity(obj GameObject) {
	p.Lock()
	defer p.Unlock()
	p.syncVel(obj)
}

func (p *Physics) Process() (updated []GameObject) {
	p.Lock()
	defer p.Unlock()

	for i := 0; i < 10; i++ {
		cp.SpaceStep(p.space, TIME_STEP/10)
	}

	for obj := range p.bodiesByObject {
		lastPos := obj.LastPosition()
		lastVel := obj.LastVelocity()

		p.update(obj)

		nextPos := obj.Position()
		nextVel := obj.Velocity()

		posUpdated := !lastPos.EqualsCoord(nextPos)
		velUpdated := !lastVel.EqualsCoord(nextVel)
		if posUpdated || velUpdated {
			updated = append(updated, obj)
		}
	}
	return
}

func (p *Physics) AddStaticBox(x, y, w, h float64) {
	topL := geom.Coord{x + 0, y + 0}
	topR := geom.Coord{x + w, y + 0}
	botL := geom.Coord{x + 0, y + h}
	botR := geom.Coord{x + w, y + h}

	p.AddStaticSegments([]geom.Segment{
		{topL, topR}, // up
		{botL, botR}, // down
		{topL, botL}, // left
		{topR, botR}, // right
	})
}

func (p *Physics) AddStaticSegments(segments []geom.Segment) {
	staticBody := cp.SpaceGetStaticBody(p.space)
	for _, s := range segments {
		a := cp.V(s.A.X, s.A.Y)
		b := cp.V(s.B.X, s.B.Y)
		shape := cp.SpaceAddShape(p.space, cp.SegmentShapeNew(staticBody, a, b, 0))
		p.static[shape] = true
	}
}

func (p *Physics) add(obj GameObject) {
	/* TODO check whether moving
	if !obj.IsMovable() {
		return
	}
	*/

	_, isKinematic := obj.(*DroppedItem)

	var body cp.Struct_SS_cpBody
	if isKinematic {
		body = cp.SpaceAddBody(p.space, cp.BodyNewKinematic())
	} else {
		offset := cp.V(0, 0)
		mass := float64(10.0)
		//mass := math.Inf(+1)
		//moment := cp.MomentForCircle(mass, 0, OBJECT_RADIUS, offset)
		moment := math.Inf(+1)

		body = cp.SpaceAddBody(p.space, cp.BodyNew(mass, moment))

		shape := cp.SpaceAddShape(p.space, cp.CircleShapeNew(body, OBJECT_RADIUS, offset))
		p.shapesByObject[obj] = shape
		cp.ShapeSetElasticity(shape, 0.0)
		cp.ShapeSetFriction(shape, 0.7)
	}

	pos := obj.Position()
	cp.BodySetPosition(body, cp.V(pos.X, pos.Y))
	//vel := obj.Velocity()
	//cp.BodySetVelocity(body, cp.V(vel.X, vel.Y))
	p.bodiesByObject[obj] = body
}

func (p *Physics) remove(obj GameObject) {
	if body, ok := p.bodiesByObject[obj]; ok {
		delete(p.bodiesByObject, obj)
		cp.SpaceRemoveBody(p.space, body)
		cp.BodyFree(body)
	}
	if shape, ok := p.shapesByObject[obj]; ok {
		delete(p.shapesByObject, obj)
		cp.SpaceRemoveShape(p.space, shape)
		cp.ShapeFree(shape)
	}
}
func (p *Physics) update(obj GameObject) {
	body, ok := p.bodiesByObject[obj]
	if !ok {
		return
	}

	// sync pos and vel
	pos := cp.BodyGetPosition(body)
	obj.SetPosition(pos.GetX(), pos.GetY())
	//vel := cp.BodyGetVelocity(body)
	//obj.SetVelocity(vel.GetX(), vel.GetY())
}
func (p *Physics) syncVel(obj GameObject) {
	body, ok := p.bodiesByObject[obj]
	if !ok {
		return
	}

	nextVel := obj.Velocity()
	lastVel := cp.BodyGetVelocity(body)

	if nextVel.X != lastVel.GetX() || nextVel.Y != lastVel.GetY() {
		cp.BodySetVelocity(body, cp.V(nextVel.X, nextVel.Y))
	}
}
