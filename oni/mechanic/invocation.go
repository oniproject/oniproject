package mechanic

type Invocation struct {
	Speed     int
	Success   int // %
	Repeats   int
	TPGain    int
	HitType   int
	Animation AnimationId
}
