package utils_test

import (
	. "github.com/smartystreets/goconvey/convey"
	. "oniproject/oni/utils"
	"testing"
)

func Test_IdPool(t *testing.T) {
	Convey("id pool", t, func() {
		pool := NewIdPool()
		So(pool.Get(), ShouldEqual, 1)
		So(pool.Get(), ShouldEqual, 2)
		So(pool.Get(), ShouldEqual, 3)

		pool.Put(5)
		So(pool.Get(), ShouldEqual, 5)
	})
}
