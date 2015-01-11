package utils

import "sync"

type IdPool struct {
	pool         []Id
	nextAvilable Id
	sync.Mutex
}

func (p *IdPool) Get() (id Id) {
	p.Lock()
	defer p.Unlock()

	if len(p.pool) != 0 {
		id = p.pool[0]
		p.pool = p.pool[1:]
		return
	}

	p.nextAvilable++
	return p.nextAvilable
}

func (p *IdPool) Put(id Id) {
	p.Lock()
	defer p.Unlock()

	p.pool = append(p.pool, id)
}
