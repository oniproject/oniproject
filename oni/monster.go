package oni

import (
	"github.com/skelterjohn/geom"
	"time"
)

type Monster struct {
	//data AvatarData
	//AvatarConnection
	Target  Id
	game    AvatarMapper
	lastvel geom.Coord

	id        Id
	MapId     Id
	position  geom.Coord
	veloctity geom.Coord
	Lag       time.Duration
}

func (a *Monster) Id() Id {
	return a.id
}

func (a *Monster) Position() geom.Coord {
	return a.position
}

func (a *Monster) Send(m Message) {
	m.Run(a)
}

func (a *Monster) GetState(typ uint8, tick uint) *State {
	return &State{typ, a.id, tick, a.Lag, a.position, a.veloctity}
}

func (a *Monster) Update(tick uint, t time.Duration) (state *State) {
	if a.veloctity.X != 0 || a.veloctity.Y != 0 {
		delta := a.veloctity.Times(t.Seconds())
		pos := a.position.Plus(delta)
		a.lastvel = a.veloctity.Times(1) // just copy

		// XXX {nil} for testing
		if a.game == nil || a.game.Walkable(int(pos.X), int(pos.Y)) {
			a.position = pos
		}
		state = a.GetState(STATE_MOVE, tick)
		return
	}

	if a.lastvel.X != 0 || a.lastvel.Y != 0 {
		a.lastvel = geom.Coord{0, 0}
		state = a.GetState(STATE_IDLE, tick)
	}

	// XXX for normal replication
	state = a.GetState(STATE_IDLE, tick)
	return
}
