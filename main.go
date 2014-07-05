package main

import (
	"./oni"
	"flag"
	"fmt"
	"gopkg.in/yaml.v1"
	"io/ioutil"
	"log"
)

var config = flag.String("conf", "default", "config file")
var master = flag.Bool("master", false, "this is a master")
var game = flag.Bool("game", false, "this is a game mechanic")
var database = flag.Bool("db", false, "this is a database")

func main() {
	flag.Parse()
	fname := fmt.Sprintf("config/%s.yml", *config)
	conf, err := ioutil.ReadFile(fname)
	if err != nil {
		log.Panicln("Fail load config file", err)
	}
	switch {
	case *master:
		m := oni.NewMaster()
		// configure
		if err := yaml.Unmarshal(conf, &m); err != nil {
			log.Panicln("[master] Fail unmarshal config file", err)
		}
		m.Run()
	case *game:
		// TODO run game
		//log.Println("run GAME:", *addr, "rpc:", *rpc)
	case *database:
		// TODO run database
		//log.Println("run DATABASE:", *addr, "rpc:", *rpc)
	default:
		// TODO run all
		//log.Println("run ALL:", *addr, "rpc:", *rpc)
	}
}
