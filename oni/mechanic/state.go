package mechanic

type StateId int

type State struct {
	// Basic settings
	Name        string
	Icon        string
	Description string

	Restriction int
	Priority    int

	// Removal Conditionns
	RemoveAtBattleEnd   bool
	RemoveByRestriction bool

	AutoRemovalTiming int
	DurationInTurns1  int
	DurationInTurns2  int

	RemoveByDamage       bool
	RemoveByDamageValue  int
	RemoveByWalking      bool
	RemoveByWalkingValue int

	MessageWhenActorEntersState string
	MessageWhenEnemyEntersState string

	MessageWhenStateRemains string
	MessageWhenStateRemoves string

	Features FeatureList

	// comment
	Note string
}
