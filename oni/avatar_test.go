package oni

import (
	"github.com/skelterjohn/geom"
	"testing"
	"time"
)

func TestAvatarUpdateIDLE(t *testing.T) {
	avatar := &Avatar{data: AvatarData{0, 0,
		geom.Coord{0, 0},
		geom.Coord{0, 0}}}
	state := avatar.Update(1, 0)

	if state.Type != STATE_IDLE {
		t.Fail()
	}
}

func TestAvatarUpdateSimple(t *testing.T) {
	avatar := &Avatar{data: AvatarData{0, 0,
		geom.Coord{0, 0},
		geom.Coord{1, 2}}}
	state := avatar.Update(1, 1*time.Second)
	t.Log(state)

	if state == nil {
		t.Fail()
	}
	if state.Position.X != 1 || state.Position.Y != 2 {
		t.Fail()
	}
}

func TestAvatarUpdateOnlyX(t *testing.T) {
	avatar := &Avatar{data: AvatarData{0, 0,
		geom.Coord{0, 0},
		geom.Coord{2, 0}}}
	state := avatar.Update(1, 1*time.Second)
	t.Log(state)

	if state == nil {
		t.Fail()
	}
	if state.Position.X != 2 || state.Position.Y != 0 {
		t.Fail()
	}
}

func TestAvatarUpdateOnlyY(t *testing.T) {
	avatar := &Avatar{data: AvatarData{0, 0,
		geom.Coord{0, 0},
		geom.Coord{0, 2}}}
	state := avatar.Update(1, 1*time.Second)
	t.Log(state)

	if state == nil {
		t.Fail()
	}
	if state.Position.X != 0 || state.Position.Y != 2 {
		t.Fail()
	}
}

func TestAvatarUpdateZero(t *testing.T) {
	avatar := &Avatar{data: AvatarData{0, 0,
		geom.Coord{0, 1},
		geom.Coord{0, 0}}}
	state := avatar.Update(1, 1*time.Second)

	if state == nil {
		t.Fail()
	}
	if state.Veloctity.X != 0 {
		t.Fail()
	}
}
