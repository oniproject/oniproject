package mechanic

import "time"

type Cooldown struct {
	Time time.Duration
}

func NewCooldown(t time.Duration) *Cooldown {
	return &Cooldown{t}
}
func (c *Cooldown) Update(t time.Duration) bool {
	c.Time -= t
	if c.Time <= 0 {
		return true
	}
	return false
}
