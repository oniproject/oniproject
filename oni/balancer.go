package oni

import (
	"github.com/gocircuit/circuit/client"
)

type Balancer struct {
	c *client.Client
}

func NewBalancer(circuit string) (b *Balancer) {
	b = &Balancer{c: client.Dial(circuit, nil)}
	return
}
