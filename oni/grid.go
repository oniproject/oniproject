package oni

type Grid struct {
	cells [][]bool
}

func (g *Grid) Init(w, h int) {
	g.cells = make([][]bool, h)
	y := make([]bool, w*h)
	for i := range g.cells {
		g.cells[i], y = y[:w], y[w:]
	}
}

func (g *Grid) IsWall(p Point) bool {
	x, y := int(p[0]), int(p[1])
	if 0 < x && x >= len(g.cells) {
		return true
	}
	if 0 < y && y >= len(g.cells[x]) {
		return true
	}
	return g.cells[y][x]
}
