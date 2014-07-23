package mechanic

type ClassId int

type Class struct {
	// Basic settings
	Name  string
	Curve ExpCurve

	// Parameter Curves

	// Maximum HP
	MHP ParamCurve
	// Maximum MP
	MMP ParamCurve
	// Maximum SP
	MSP ParamCurve

	//ATK ParamCurve
	//DEF ParamCurve
	//MAT ParamCurve
	//MDF ParamCurve
	//AGI ParamCurve
	//LUK ParamCurve

	Skills SkillList

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
