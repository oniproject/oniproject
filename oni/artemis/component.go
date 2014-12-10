package artemis

import (
	"fmt"
	"reflect"
)

// A tag class. All components in the system must extend this class.
type Component interface{}

var _INDEX = 0
var componentTypes = make(map[reflect.Type]*ComponentType)

type ComponentType struct {
	index int
	t     reflect.Type
}

func (ct *ComponentType) Index() int { return ct.index }
func (ct *ComponentType) String() string {
	return fmt.Sprintf("ComponentType[%s] (%d)", ct.t.String(), ct.index)
}

func newComponentType(t reflect.Type) *ComponentType {
	_INDEX++
	return &ComponentType{
		t:     t,
		index: _INDEX,
	}
}

func getTypeFor(c Component) *ComponentType {
	t := reflect.TypeOf(c)
	ct, ok := componentTypes[t]
	if !ok {
		ct = newComponentType(t)
		componentTypes[t] = ct
	}
	return ct
}

func getIndexFor(c Component) int {
	return getTypeFor(c).Index()
}
