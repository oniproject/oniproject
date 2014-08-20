package main

import (
	"flag"
	"log"
	"oniproject/oni"
)

var config = flag.String("conf", "default", "config file")
var master = flag.Bool("master", false, "this is a master")
var game = flag.Bool("game", false, "this is a game mechanic")
var database = flag.Bool("db", false, "this is a database")

var circuit = flag.String("c", "", "circuit address")

func main() {
	log.SetFlags(log.Lshortfile)
	flag.Parse()

	conf := oni.NewConfig(*config)

	switch {
	case *master:
	case *game:
	case *database:
	default:
		db := oni.NewDatabase(conf)
		balancer := oni.NewBalancer(conf, db)

		module := oni.NewMaster(conf, balancer)

		go module.Run()
		balancer.Game.Run()
	}
}
