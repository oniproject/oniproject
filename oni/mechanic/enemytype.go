package mechanic

type EnemyType struct {
	// Basic settings
	Name        string
	Icon        string
	Description string

	Parameters map[ParameterId]int

	// Rewards
	EXP  int
	Gold int

	Features FeatureList

	// comment
	Note string
}
