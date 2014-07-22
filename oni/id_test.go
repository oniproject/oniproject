package oni

import "testing"

func TestId_IsAvatar(t *testing.T) {
	id := NewAvatarId(0xff)

	if !id.IsAvatar() {
		t.Fail()
	}

	id = Id(0xff)
	if id.IsAvatar() {
		t.Fail()
	}
}
