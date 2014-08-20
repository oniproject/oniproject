package jps

func (grid *Grid) getNeighbors(node *Node, allowDiagonal, dontCrossCorners bool) []Point {
	x, y := node.X, node.Y
	s0, d0 := false, false
	s1, d1 := false, false
	s2, d2 := false, false
	s3, d3 := false, false

	neighbors := []Point{}

	// ↑
	if grid.Walkable(x, y-1) {
		neighbors = append(neighbors, grid.At(x, y-1).Point)
		s0 = true
	}
	// →
	if grid.Walkable(x+1, y) {
		neighbors = append(neighbors, grid.At(x+1, y).Point)
		s1 = true
	}
	// ↓
	if grid.Walkable(x, y+1) {
		neighbors = append(neighbors, grid.At(x, y+1).Point)
		s2 = true
	}
	// ←
	if grid.Walkable(x-1, y) {
		neighbors = append(neighbors, grid.At(x-1, y).Point)
		s3 = true
	}

	if !allowDiagonal {
		return neighbors
	}

	if dontCrossCorners {
		d0 = s3 && s0
		d1 = s0 && s1
		d2 = s1 && s2
		d3 = s2 && s3
	} else {
		d0 = s3 || s0
		d1 = s0 || s1
		d2 = s1 || s2
		d3 = s2 || s3
	}

	// ↖
	if d0 && grid.Walkable(x-1, y-1) {
		neighbors = append(neighbors, grid.At(x-1, y-1).Point)
	}
	// ↗
	if d1 && grid.Walkable(x+1, y-1) {
		neighbors = append(neighbors, grid.At(x+1, y-1).Point)
	}
	// ↘
	if d2 && grid.Walkable(x+1, y+1) {
		neighbors = append(neighbors, grid.At(x+1, y+1).Point)
	}
	// ↙
	if d3 && grid.Walkable(x-1, y+1) {
		neighbors = append(neighbors, grid.At(x-1, y+1).Point)
	}

	return neighbors
}
