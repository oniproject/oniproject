package utils

import (
	"fmt"
	"github.com/oniproject/geom"
)

type Item interface {
	Position() geom.Coord
}

type Node struct {
	Height    int       // Max depth of search tree
	Bounds    geom.Rect // a promise that nothing added will be outside this bounds
	Partition geom.Coord
	Subtrees  [4]*Node
	Elements  []Item
}

type Tree struct {
	SplitCount int // Exclusive upper bound before splitting a node
	root       Node
}

func NewQTree(bounds geom.Rect, height, max int) (me *Tree) {
	me = &Tree{
		SplitCount: max,
		root: Node{
			Height:    height,
			Bounds:    bounds,
			Partition: bounds.Min.Plus(bounds.Max).Times(0.5),
		},
	}
	return
}

func (me *Tree) Insert(element Item) (inserted bool) {
	return me.insert(&me.root, element)
}
func (me *Tree) Remove(element Item) (ok bool) {
	return me.remove(&me.root, element)
}

func (me *Tree) Inside(bounds geom.Rect) (items []Item) {
	return me.inside(&me.root, bounds)
}

func (wtf *Tree) insert(node *Node, element Item) (ok bool) {
	if !node.Bounds.ContainsCoord(element.Position()) {
		return
	}

	//if we're at the bottom, stop here
	if node.Height == 0 {
		node.Elements = append(node.Elements, element)
		return true
	}

	//if we've got enough at this level, break into subtrees
	if len(node.Elements) == wtf.SplitCount {
		wtf.split(node)
		for _, elem := range node.Elements {
			for _, t := range node.Subtrees {
				wtf.insert(t, elem)
			}
		}
		node.Elements = nil
	}

	//if we already have subtrees, insert into them
	if node.Subtrees[0] != nil {
		for _, t := range node.Subtrees {
			if wtf.insert(t, element) {
				return true
			}
		}
		return false
	}

	//no subtrees, stop here
	node.Elements = append(node.Elements, element)

	return true
}

func (wtf *Tree) split(node *Node) {
	for i, t := range node.Subtrees {
		if t == nil {
			subbounds := node.Bounds
			switch i {
			case 0:
				subbounds.Min.X = node.Partition.X
				subbounds.Min.Y = node.Partition.Y
			case 1:
				subbounds.Min.X = node.Partition.X
				subbounds.Max.Y = node.Partition.Y
			case 2:
				subbounds.Max.X = node.Partition.X
				subbounds.Min.Y = node.Partition.Y
			case 3:
				subbounds.Max.X = node.Partition.X
				subbounds.Max.Y = node.Partition.Y
			}
			h := node.Height
			h--
			node.Subtrees[i] = &Node{
				Height:    h,
				Bounds:    subbounds,
				Partition: subbounds.Min.Plus(subbounds.Max).Times(0.5),
			}
		}
	}

	return
}

func (wtf *Tree) remove(node *Node, element Item) (ok bool) {
	if !node.Bounds.ContainsCoord(element.Position()) {
		return
	}

	for i, elem := range node.Elements {
		if elem == element {
			node.Elements = append(node.Elements[:i], node.Elements[i+1:]...)
			return true
		}
	}

	for _, t := range node.Subtrees {
		if t != nil && wtf.remove(t, element) {
			return true
		}
	}

	return
}
func (wtf *Tree) inside(node *Node, bounds geom.Rect) (items []Item) {
	if !geom.RectsIntersect(bounds, node.Bounds) {
		return
	}

	for _, elem := range node.Elements {
		if bounds.ContainsCoord(elem.Position()) {
			items = append(items, elem)
		}
	}

	for _, t := range node.Subtrees {
		if t != nil {
			items = append(items, wtf.inside(t, bounds)...)
		}
	}
	return
}

func (me *Tree) InsideDo(bounds geom.Rect, f func(Item)) {
	for _, item := range me.Inside(bounds) {
		f(item)
	}
	return
}

func (node *Node) String() string {
	return fmt.Sprintf("Elem:%v {%v}\n", node.Elements, node.Subtrees)
}

func (me *Tree) String() string {
	return fmt.Sprintf("QTree{root: %v}", me.root)
}

/*
func (me *Tree) Find(element Item) (found Item, ok bool) {
	if !me.Bounds.ContainsCoord(found.Position()) {
		return
	}
	if me.Elements != nil {
		for elem := range me.Elements {
			//if element.Equals(elem) {
			if elem == element {
				found = elem
				ok = true
				return
			}
		}
		return
	}
	for _, t := range me.Subtrees {
		if t == nil {
			continue
		}
		found, ok = t.Find(element)
		if ok {
			return
		}
	}
	return
}

func (me *Tree) FindOrInsert(element Item) (found Item, inserted bool) {
	if !me.Bounds.ContainsCoord(element.Position()) {
		dbg("doesn't belong in %v", me.Bounds)
		return
	}

	if me.Height == 0 {
		if me.Elements == nil {
			me.Elements = make(map[Item]bool)
		}
	} else {
		if me.Elements != nil && len(me.Elements) == me.SplitCount {
			for elem := range me.Elements {
				me.insertSubTrees(elem)
			}
			me.Elements = nil
		}
	}

	if me.Subtrees[0] != nil {
		dbg("looking through subtrees")
		for _, t := range me.Subtrees {
			if t == nil {
				continue
			}
			foundInSubtree, insertedInSubtree := t.FindOrInsert(element)
			if foundInSubtree != nil {
				// if found in the subtree, all subtrees should agree here
				found = foundInSubtree
				inserted = insertedInSubtree
			}
		}

		return
	}

	if me.Elements != nil {
		dbg("looking through Element")
		for elem := range me.Elements {
			//if geom.RectsEqual(elem.Bounds(), element.Bounds()) {
			//if element.Equals(elem) {
			if elem == element {
				found = elem
				inserted = false
				return
			}
		}
	} else {
		me.Elements = make(map[Item]bool)
	}

	me.Elements[element] = true
	found = element
	inserted = true
	return
}
*/
