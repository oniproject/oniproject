package oni

import "math"

type Point [2]float64

func (p *Point) X() float64 {
	return p[0]
}
func (p *Point) Y() float64 {
	return p[1]
}

func (p *Point) SquareDistance(to Point) float64 {
	x := p.X() - to.X()
	y := p.Y() - to.Y()
	return x*x + y*y
}

func (p *Point) SqrtDistance(to Point) float64 {
	return math.Sqrt(p.SquareDistance(to))
}
