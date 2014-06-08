package main

import (
	"./oni"
	"flag"
	"log"
)

var addr = flag.String("addr", ":8000", "http address")
var rpc = flag.String("rpc", ":7000", "rpc address for connect to master")
var master = flag.Bool("master", false, "this is a master")
var game = flag.Bool("game", false, "this is a game mechanic")
var database = flag.Bool("db", false, "this is a database")

func main() {
	flag.Parse()
	switch {
	case *master:
		m := oni.NewMaster(*addr, *rpc)
		// configure
		m.Run()
	case *game:
		// TODO run game
		log.Println("run GAME:", *addr, "rpc:", *rpc)
	case *database:
		// TODO run database
		log.Println("run DATABASE:", *addr, "rpc:", *rpc)
	default:
		// TODO run all
		log.Println("run ALL:", *addr, "rpc:", *rpc)
	}
}
