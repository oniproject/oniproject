package mechanic

type Actor struct {
	Class ClassId
	//Race RaceId

	EXP int // Experience Points
	HP  int // Hit Points
	MP  int // Magic Points
	TP  int // Tehnical Points
	DPS int // Damage Per Second

	Parameters   map[ParameterId]int
	ExParameters map[ExParameterId]int
	SpParameters map[SpParameterId]int
}
