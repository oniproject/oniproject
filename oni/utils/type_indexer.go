package utils

import (
	"reflect"
)

type TypeIndexer struct {
	nextAvailable uint
	idByType      map[reflect.Type]uint
	typeById      map[uint]reflect.Type
}

func NewTypeIndexer() TypeIndexer {
	return TypeIndexer{
		nextAvailable: 0,
		idByType:      make(map[reflect.Type]uint),
		typeById:      make(map[uint]reflect.Type),
	}
}

func (indexer *TypeIndexer) For(obj interface{}) (id uint) {
	t := reflect.TypeOf(obj)
	return indexer.ForT(t)
}

func (indexer *TypeIndexer) ForT(t reflect.Type) (id uint) {
	id, ok := indexer.idByType[t]
	if !ok {
		id = indexer.nextAvailable
		indexer.nextAvailable++
		indexer.RegisterT(id, t)
	}
	return
}

func (indexer *TypeIndexer) Register(id uint, obj interface{}) {
	indexer.RegisterT(id, reflect.TypeOf(obj))
}
func (indexer *TypeIndexer) RegisterT(id uint, t reflect.Type) {
	indexer.idByType[t] = id
	indexer.typeById[id] = t
}

func (indexer *TypeIndexer) Create(id uint) interface{} {
	t := indexer.typeById[id]
	return reflect.New(t).Interface()
}

func (indexer *TypeIndexer) Test(obj interface{}) bool {
	t := reflect.TypeOf(obj)
	return indexer.TestT(t)
}
func (indexer *TypeIndexer) TestT(t reflect.Type) (ok bool) {
	_, ok = indexer.idByType[t]
	return
}
func (indexer *TypeIndexer) TestId(id uint) (ok bool) {
	_, ok = indexer.typeById[id]
	return
}
