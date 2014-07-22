package oni

type Point [2]float64

func (p *Point) X() float64 {
	return p[0]
}
func (p *Point) Y() float64 {
	return p[1]
}
