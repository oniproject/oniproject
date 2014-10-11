#!/bin/bash

mockgen -package="mock"  oniproject/oni/game EffectReceiver,FeatureReceiver,SkillTarget > oni/game/mock/mock.go
go test ./oni... -v

go test -coverprofile=coverage.out ./oni/game
go tool cover -html=coverage.out
rm -f coverage.out
