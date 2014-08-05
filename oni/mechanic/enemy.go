package mechanic

type Enemy struct {
}

// Yep. Monster is 0 race
func (e *Enemy) Race() int { return 0 }
