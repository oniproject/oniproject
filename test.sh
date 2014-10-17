#!/bin/bash

mockgen -package="mock"  oniproject/oni/game EffectReceiver,FeatureReceiver,SkillTarget,Walkabler > oni/game/mock/mock.go

#go test ./oni... -v
#go test ./oni/game -v

echo COVER
go test -coverprofile=coverage.out ./oni/game -v
go tool cover -html=coverage.out
rm -f coverage.out
