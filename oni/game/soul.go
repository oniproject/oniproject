package game

type Ability struct {
	Level int
	EXP   int
}

type Soul struct {
	ClassId int
	RaceId  int

	EXP int // Experience Points

	Level struct {
		Initial int
		Max     int
		Current int
	}
	Abilities map[string]Ability
}

func (s *Soul) Name() string { return "soul" }
