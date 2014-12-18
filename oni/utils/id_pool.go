package utils

import "sync"

type Local uint

func NewIdPool() sync.Pool {
	maxId := Local(0)
	return sync.Pool{
		New: func() interface{} {
			maxId++
			id := maxId
			return id
		},
	}
}
