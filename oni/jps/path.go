package jps

import "math"
import "container/heap"

func manhattan(dx, dy int) int {
	return int(math.Abs(float64(dx)) + math.Abs(float64(dy)))
}

func euclidian(dx, dy float64) int {
	return int(math.Sqrt(math.Abs(dx*dx) + math.Abs(dy*dy)))
}

func (grid *Grid) FindPath(start, end Point) []Point {
	toClean := []*Node{}
	// XXX cleanup
	defer func() {
		for _, p := range toClean {
			grid.nodes[p.Y][p.X] = Node{
				Point: p.Point, Walkable: p.Walkable,
			}
		}
	}()
	openList := &nodeHeap{}
	heap.Init(openList)

	startNode := grid.at(start)
	endNode := grid.at(end)

	// set the `g` and `f` value of the start node to be 0
	startNode.G = 0
	startNode.F = 0

	// push the start node into the open list
	heap.Push(openList, startNode)
	startNode.Opened = true

	// while the open list is not empty
	for openList.Len() != 0 {
		// pop the position of node which has the minimum `f` value.
		node := heap.Pop(openList).(*Node)
		node.Closed = true
		toClean = append(toClean, node)

		if node.X == endNode.X && node.Y == endNode.Y {
			return endNode.Backtrace()
		}
		grid.identifySuccessors(node, openList, endNode)
	}

	// fail to find the path
	return nil
}

func (grid *Grid) identifySuccessors(node *Node, openList *nodeHeap, end *Node) {
	neighbors := grid.findNeighbors(node)

	for _, neighbor := range neighbors {
		jumpPoint := grid.jump(neighbor.X, neighbor.Y, node.X, node.Y, end)
		if jumpPoint != nil {
			x, y := node.X, node.Y
			jx, jy := jumpPoint.X, jumpPoint.Y

			jumpNode := grid.At(jx, jy)

			if jumpNode.Closed {
				continue
			}

			// include distance, as parent may not be immediately adjacent:
			// next `g` value
			ng := node.G + euclidian(math.Abs(float64(jx-x)), math.Abs(float64(jy-y)))

			if !jumpNode.Opened || ng < jumpNode.G {
				jumpNode.G = ng
				if jumpNode.H == 0 {
					jumpNode.H = manhattan(jx-end.X, jy-end.Y)
					// XXX  speed and bugly
					// jumpNode.H = (jx - end.X) - (jy - end.Y)
				}
				jumpNode.F = jumpNode.G + jumpNode.H
				jumpNode.Parent = node

				if !jumpNode.Opened {
					heap.Push(openList, jumpNode)
					jumpNode.Opened = true
				} else {
					// FIXME
					heap.Init(openList)
					/*for i, item := range *openList {
						if item.X == jumpNode.X && item.Y == jumpNode.Y {
							(*openList)[i] = jumpNode
							heap.Fix(openList, i)
						}
					}*/
				}
			}
		}
	}
}

func (grid *Grid) findNeighbors(node *Node) []Point {
	// directed pruning: can ignore most neighbors, unless forced.
	if node.Parent != nil {
		neighbors := []Point{}
		x, y := node.X, node.Y
		px, py := node.Parent.X, node.Parent.Y

		// get the normalized direction of travel
		dx := int(float64(node.X-px) / math.Max(math.Abs(float64(node.X-px)), 1))
		dy := int(float64(node.Y-py) / math.Max(math.Abs(float64(node.Y-py)), 1))

		if dx != 0 && dy != 0 { // search diagonally
			if grid.Walkable(x, y+dy) {
				neighbors = append(neighbors, Point{x, y + dy})
			}
			if grid.Walkable(x+dx, y) {
				neighbors = append(neighbors, Point{x + dx, y})
			}
			if grid.Walkable(x, y+dy) || grid.Walkable(x+dx, y) {
				neighbors = append(neighbors, Point{x + dx, y + dy})
			}
			if !grid.Walkable(x-dx, y) && grid.Walkable(x, y+dy) {
				neighbors = append(neighbors, Point{x - dx, y + dy})
			}
			if !grid.Walkable(x, y-dy) && grid.Walkable(x+dx, y) {
				neighbors = append(neighbors, Point{x + dx, y - dy})
			}
		} else { // search horizontally/vertically
			if dx == 0 {
				if grid.Walkable(x, y+dy) {
					neighbors = append(neighbors, Point{x, y + dy})
					if !grid.Walkable(x+1, y) {
						neighbors = append(neighbors, Point{x + 1, y + dy})
					}
					if !grid.Walkable(x-1, y) {
						neighbors = append(neighbors, Point{x - 1, y + dy})
					}
				}
			} else {
				neighbors = append(neighbors, Point{})
				if grid.Walkable(x+dx, y) {
					neighbors = append(neighbors, Point{x + dx, y})
					if !grid.Walkable(x, y+1) {
						neighbors = append(neighbors, Point{x + dx, y + 1})
					}
					if !grid.Walkable(x, y-1) {
						neighbors = append(neighbors, Point{x + dx, y - 1})
					}
				}
			}
		}
		return neighbors
	} else { // return all neighbors
		return grid.getNeighbors(node, true, false)
	}
}

func (grid *Grid) jump(x, y, px, py int, endNode *Node) *Point {
	if !grid.Walkable(x, y) {
		return nil
	}

	if x == endNode.X && y == endNode.Y {
		return &Point{x, y}
	}

	dx := x - px
	dy := y - py

	// check for forced neighbors
	if dx != 0 && dy != 0 { // along the diagonal
		if (grid.Walkable(x-dx, y+dy) && !grid.Walkable(x-dx, y)) ||
			(grid.Walkable(x+dx, y-dy) && !grid.Walkable(x, y-dy)) {
			return &Point{x, y}
		}
	} else { // horizontally/vertically
		if dx != 0 { // moving along x
			if (grid.Walkable(x+dx, y+1) && !grid.Walkable(x, y+1)) ||
				(grid.Walkable(x+dx, y-1) && !grid.Walkable(x, y-1)) {
				return &Point{x, y}
			}
		} else {
			if (grid.Walkable(x+1, y+dy) && !grid.Walkable(x+1, y)) ||
				(grid.Walkable(x-1, y+dy) && !grid.Walkable(x-1, y)) {
				return &Point{x, y}
			}
		}
	}

	// when moving diagonally, must check for vertical/horizontal jump points
	if dx != 0 && dy != 0 {
		if grid.jump(x+dx, y, x, y, endNode) != nil || grid.jump(x, y+dy, x, y, endNode) != nil {
			return &Point{x, y}
		}
	}

	// moving diagonally, must make sure one of the vertical/horizontal
	// neighbors is open to allow the path
	if grid.Walkable(x+dx, y) || grid.Walkable(x, y+dy) {
		return grid.jump(x+dx, y+dy, x, y, endNode)
	} else {
		return nil
	}
}
