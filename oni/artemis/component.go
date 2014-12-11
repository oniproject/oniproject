package artemis

import (
	"reflect"
)

// A tag class. All components in the system must extend this class.
type Component interface {
	Name() string
}

var _INDEX = uint(0)
var componentTypes = make(map[reflect.Type]uint)

func GetIndexFor(c Component) uint {
	t := reflect.TypeOf(c)
	ct, ok := componentTypes[t]
	if !ok {
		_INDEX++
		ct = _INDEX
		componentTypes[t] = ct
	}
	return ct
}
