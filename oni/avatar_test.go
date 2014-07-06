package oni

import (
	"testing"
	"time"
)

func TestAvatarUpdateNil(t *testing.T) {
	avatar := &Avatar{
		[2]float64{0, 0},
		[2]float64{0, 0},
		[2]float64{0, 0}}
	state := avatar.Update(0)

	if state != nil {
		t.Fail()
	}
}

func TestAvatarUpdateSimple(t *testing.T) {
	avatar := &Avatar{
		[2]float64{0, 0},
		[2]float64{1, 2},
		[2]float64{0, 0}}
	state := avatar.Update(1 * time.Second)
	t.Log(state)

	if state == nil {
		t.Fail()
	}
	if state.Position[0] != 1 || state.Position[1] != 2 {
		t.Fail()
	}
}

func TestAvatarUpdateZero(t *testing.T) {
	avatar := &Avatar{
		[2]float64{0, 1},
		[2]float64{0, 0},
		[2]float64{1, 0}}
	state := avatar.Update(1 * time.Second)

	if state == nil {
		t.Fail()
	}
	if state.Veloctity[0] != 0 {
		t.Fail()
	}
}
