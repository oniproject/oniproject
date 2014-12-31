package game

/*
import (
	"./mock"
	gomock "code.google.com/p/gomock/gomock"
	"path"
	"testing"
	"time"
)

var add_def, _ = LoadStateYaml(path.Join(STATE_PATH, "add_def.yml"))

func TestState(t *testing.T) {
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()

	target := mock.NewMockFeatureReceiver(mockCtrl)
	target.EXPECT().AddDEF(10)

	add_def.ApplyFeatures(target)

	if add_def.CheckAutoRemoval(time.Now(), time.Now()) {
		t.Error("fail AutoRemoval 1")
	}
	if !add_def.CheckAutoRemoval(time.Now(), time.Now().Add(9*time.Second)) {
		t.Error("fail AutoRemoval 2")
	}

	add_def.AutoRemovalTiming = 0
	if add_def.CheckAutoRemoval(time.Now(), time.Now().Add(8*time.Second)) {
		t.Error("fail AutoRemoval 3")
	}
}
*/
