package utils_test

import (
	. "."
	. "github.com/oniproject/geom"
	"math"
	"math/rand"
	"testing"
)

type item Coord

func (i *item) Position() Coord { return Coord(*i) }

func Test(t *testing.T) {
	qt := NewQTree(Rect{Coord{0, 0}, Coord{100, 100}}, 10, 5)

	t.Log(qt.Insert(&item{10, 5}))
	t.Log(qt.Insert(&item{30, 7}))
	t.Log(qt.Insert(&item{3, 7}))
	t.Log(qt.Insert(&item{3, 99}))
	t.Log(qt.Insert(&item{50, 99}))
	t.Log(qt.Insert(&item{30, 30}))

	t.Log(qt)
	collection := make(map[Item]bool)
	qt.InsideDo(Rect{Coord{10, 20}, Coord{40, 40}}, func(i Item) {
		collection[i] = true
	})

	t.Logf("%v\n", collection)
	t.Log(qt)
}

// World-space extends from -1000..1000 in X and Y direction
var world = Rect{Coord{-1000.0, 1000.0}, Coord{-1000.0, 1000.0}}

// A set of 10 million randomly distributed rectangles of avg size 5
var items10M = randomItems(10*1000*1000, world, 5)

func BenchmarkInsert(b *testing.B) {
	b.StopTimer()
	rand.Seed(1)

	qt := NewQTree(world, 100, 5)
	items := randomItems(b.N, world, 5)

	b.StartTimer()
	for i := 0; i < b.N; i++ {
		qt.Insert(items[i])
	}
}

// Benchmark quad-tree on set of rectangles
func BenchmarkInside(b *testing.B) {
	b.StopTimer()
	rand.Seed(1)

	qt := NewQTree(world, 100, 5)
	for _, v := range items10M {
		qt.Insert(v)
	}

	queries := randomBoundingBoxes(b.N, world, 10)

	b.StartTimer()
	for _, q := range queries {
		qt.Inside(q)
	}
}

// Benchmark simple look up on set of rectangles
func BenchmarkLinear(b *testing.B) {
	b.StopTimer()
	rand.Seed(1)
	queries := randomBoundingBoxes(b.N, world, 10)
	b.StartTimer()
	for _, q := range queries {
		queryLinear(items10M, q)
	}
}

// Generates n BoundingBoxes in the range of frame with average width and height avgSize
func randomItems(n int, frame Rect, avgSize float64) []*item {
	ret := make([]*item, n)

	for i := 0; i < len(ret); i++ {
		x := rand.Float64()*frame.Width() + frame.Min.X
		y := rand.Float64()*frame.Height() + frame.Min.Y
		ret[i] = &item{x, y}
	}

	return ret
}

// Generates n BoundingBoxes in the range of frame with average width and height avgSize
func randomBoundingBoxes(n int, frame Rect, avgSize float64) []Rect {
	ret := make([]Rect, n)

	for i := 0; i < len(ret); i++ {
		w := rand.NormFloat64() * avgSize
		h := rand.NormFloat64() * avgSize
		x := rand.Float64()*frame.Width() + frame.Min.X
		y := rand.Float64()*frame.Height() + frame.Min.Y
		ret[i] = Rect{Coord{x, math.Min(frame.Max.X, x+w)}, Coord{y, math.Min(frame.Max.Y, y+h)}}
	}

	return ret
}

// Returns all elements of data which intersect query
func queryLinear(data []*item, query Rect) (ret []*item) {
	for _, v := range data {
		if query.ContainsCoord(v.Position()) {
			ret = append(ret, v)
		}
	}

	return ret
}
