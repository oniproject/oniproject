package jps

import "strings"

type Point struct {
	X, Y int
}

type Node struct {
	Point
	Walkable       bool
	G, H, F        int
	Opened, Closed bool
	Parent         *Node
}

func (n *Node) Backtrace() []Point {
	node := n
	path := []Point{node.Point}
	for node.Parent != nil {
		node = node.Parent
		path = append(path, node.Point)
	}
	// TODO reverse
	return path
}

type Grid struct {
	nodes [][]Node
}

// Create clean Grid
// Walkable is false by default
func NewGrid(width, height int) (g *Grid) {
	g = &Grid{}
	g.buildNodes(width, height)
	return
}

/* Load Grid from string
'.', ' ', 'S', 'F', 'E', 'T' runes interpreted by Walkable=true
*/
func FromString(input string, width, height int) (g *Grid) {
	g = &Grid{}
	g.buildNodes(width, height)
	for y, row := range strings.Split(strings.TrimSpace(input), "\n") {
		for x, raw := range row {
			switch raw {
			case 'S', 'F':
				g.SetWalkable(x, y, true)
			case 'E', 'T':
				g.SetWalkable(x, y, true)
			case '.', ' ':
				g.SetWalkable(x, y, true)
			default:
				g.SetWalkable(x, y, false)
			}
		}
	}
	return
}

// Load Grid from bool matrix
func FromMatrix(input [][]bool, width, height int) (g *Grid) {
	g = &Grid{}
	g.buildNodes(width, height)
	for y, row := range input {
		for x, raw := range row {
			g.SetWalkable(x, y, raw)
		}
	}
	return g
}

// Return true if node is walkable
func (g *Grid) Walkable(x, y int) bool {
	if g.Inside(x, y) {
		return g.nodes[y][x].Walkable
	}
	return false
}

// Set node[y][x].Walkable
func (g *Grid) SetWalkable(x, y int, walkable bool) {
	if !g.Inside(x, y) {
		return
	}
	g.nodes[y][x].Walkable = walkable
}

// Return true if x,y is falid position
func (g *Grid) Inside(x, y int) bool {
	return (y >= 0 && y < g.Height()) && (x >= 0 && x < g.Width())
}

// Get node by position
func (g *Grid) At(x, y int) *Node {
	if !g.Inside(x, y) {
		return nil
	}
	n := &g.nodes[y][x]
	n.X = x
	n.Y = y
	return n
	//return &Node{Point: Point{x, y}, Walkable: n.Walkable}
}
func (g *Grid) at(p Point) *Node {
	return g.At(p.X, p.Y)
}

func (g *Grid) Width() int {
	if g.Height() != 0 {
		return len(g.nodes[0])
	}
	return 0
}
func (g *Grid) Height() int {
	return len(g.nodes)
}

func (g *Grid) buildNodes(w, h int) {
	g.nodes = make([][]Node, h)
	nodes := make([]Node, w*h)
	for i := range g.nodes {
		g.nodes[i], nodes = nodes[:w], nodes[w:]
	}
}
