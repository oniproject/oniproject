package game

import (
	"strconv"
	"strings"
)

type FeatureReceiver interface {
	AddATK(int)
	AddDEF(int)
	AddSkill(string)
	SealSkill(string)
}

type FeatureList []Feature

func (list FeatureList) Run(r FeatureReceiver) {
	for _, f := range list {
		f.Run(r)
	}
}

type Feature string

func (f Feature) Run(r FeatureReceiver) {
	args := strings.Split(string(f), " ")
	name := args[0]
	value, _ := strconv.ParseInt(args[1], 10, 32)
	switch name {
	case "atk":
		r.AddATK(int(value))
	case "def":
		r.AddDEF(int(value))
	case "skill":
		r.AddSkill(args[1])
	case "rm-skill":
		r.SealSkill(args[1])
	}
	return
}
