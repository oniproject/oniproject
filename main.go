package main

import (
	"flag"
	"log"
	"oniproject/oni"
	"os"
)

var config = flag.String("conf", "default", "config file")
var master = flag.Bool("master", false, "this is a master")
var game = flag.Bool("game", false, "this is a game mechanic")
var database = flag.Bool("db", false, "this is a database")

var circuit = flag.String("c", "", "circuit address")

func main() {
	log.SetFlags(log.Llongfile)
	log.SetPrefix("\033[01;07;38;05;196m[WAT?]\033[0m ")
	flag.Parse()

	conf := oni.NewConfig(*config)

	host := os.Getenv("HOST")
	port := os.Getenv("PORT")
	if port != "" {
		conf.Addr = host + ":" + port
	}

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
