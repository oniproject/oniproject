package mechanic

import (
	"testing"
	"time"
)

func TestCooldown(t *testing.T) {
	time := 10 * time.Second
	c := NewCooldown(time)
	if c.Update(time / 2) {
		t.Fail()
	}
	if !c.Update(time / 2) {
		t.Fail()
	}
}
