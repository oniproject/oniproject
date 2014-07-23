package mechanic

type ClassId int

type Level int

type Class struct {
	// Basic settings
	Name        string
	Icon        string
	Description string

	Curve           ExpCurve
	ParameterCurves map[ParameterId]ParamCurve
	Skills          map[Level]Skill

	Features FeatureList

	// comment
	Note string
}

type ExpCurve struct {
	BaseValue     int
	ExtraValue    int
	AccelerationA int
	AccelerationB int
}

type ParamCurve struct {
	Level1  int
	Level99 int
}
