package jps

import "testing"
import "strings"

const (
	// KindPlain (.) is a plain tile with a movement cost of 1.
	KindPlain = iota
	// KindBlocker (X) is a tile which blocks movement.
	KindBlocker
	// KindFrom (F) is a tile which marks where the path should be calculated from.
	KindFrom
	// KindTo (T) is a tile which marks the goal of the path.
	KindTo
	// KindPath (●) is a tile to represent where the path is in the output.
	KindPath
)

// KindRunes map tile kinds to output runes.
var KindRunes = map[int]rune{
	KindPlain:   '.',
	KindBlocker: 'X',
	KindFrom:    'F',
	KindTo:      'T',
	KindPath:    '●',
}

// RuneKinds map input runes to tile kinds.
var RuneKinds = map[rune]int{
	'.': KindPlain,
	'X': KindBlocker,
	'F': KindFrom,
	'T': KindTo,
	'●': KindPath,
}

func ParseWorld(input string) (g *Grid, start Point, end Point) {
	g = &Grid{}
	is := false
	rows := strings.Split(strings.TrimSpace(input), "\n")
	for y, row := range rows {
		if len(row) == 0 {
			continue
		}
		if !is {
			g.nodes = make([][]Node, len(rows))
			is = true
		}
		g.nodes[y] = make([]Node, len(row))
		for x, raw := range row {
			switch raw {
			case 'S', 'F':
				g.nodes[y][x].Walkable = true
				start.X = x
				start.Y = y
			case 'E', 'T':
				g.nodes[y][x].Walkable = true
				end.X = x
				end.Y = y
			case '.', ' ':
				g.nodes[y][x].Walkable = true
			default:
				g.nodes[y][x].Walkable = false
			}
		}
	}
	return
}

func testPath(input string, t *testing.T, found bool) {
	g, s, e := ParseWorld(input)
	path := g.FindPath(s, e)
	if found && len(path) == 0 {
		t.Fatal("path not finding")
	}
	if !found && len(path) != 0 {
		t.Fatal("path finding", path)
	}
	t.Log("first:", path)

	path = g.FindPath(s, e)
	if found && len(path) == 0 {
		t.Fatal("[double] path not finding")
	}
	if !found && len(path) != 0 {
		t.Fatal("[double] path finding", path)
	}
	t.Log("second:", path)
}

func TestFirst(t *testing.T) {
	testPath(`
.....~......
.....MM.....
.F........T.
....MMM.....
............
`, t, true)
	testPath(`
.....~......
.....MM.....
.F..MMMM..T.
....MMM.....
............
`, t, true)
	testPath(`
............
.........XXX
.F.......XTX
.........XXX
............
`, t, false)
	testPath(`
FX.X........
.X...XXXX.X.
.X.X.X....X.
...X.X.XXXXX
.XX..X.....T
`, t, true)
}

var large = `
F............................~.................................................
.............................~.................................................
........M...........X........~.................................................
.......MMM.........X.........~~................................................
........MM........X...........~................................................
.......MM........X............~................................................
................X.............~................................................
...............X..............~~...............................................
..............X................~...............................................
.............X.................~...X...............~...........................
............X.......................X..............~...........................
...........X.........................X.............~...........................
..........X..................~........X............~...........................
.........X...................~.........X...........~...........................
.............................~..........X..........~...............XXXXXXXXXXXX
............................~............X..........~..............X...X...X...
............................~.............X.........~......MMM.....X.X.X.X.X.X.
............................~..............X........~......MM......X.X.X.X.X.X.
............................~...............X.......~....MMMM......X.X.X.X.X.X.
...........................~.................X.....~......MMM......X.X.X.X.X.X.
..............................................X....~.......MM......X.X.X.X.X.X.
...............................................X...~.......M.........X...X...XT
`

var world, start, end = ParseWorld(large)

func TestLarge(t *testing.T) {
	testPath(large, t, true)
}

func TestX(t *testing.T) {
	grid := FromString(`
XXX....XXX
X.X.XX...X
X.X..X...X
X.XX.X...X
X....XXXXX`, 20, 20)
	t.Log(grid.FindPath(Point{1, 2}, Point{7, 4}))
}

func BenchmarkLarge(b *testing.B) {
	for i := 0; i < b.N; i++ {
		path := world.FindPath(start, end)
		if len(path) == 0 {
			b.Fatal("path not finding")
		}
		//Path(world.From(), world.To())
	}
}
