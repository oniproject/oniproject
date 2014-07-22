package main

import (
	"flag"
	"fmt"
	"gopkg.in/yaml.v1"
	"io/ioutil"
	"log"
	"oniproject/oni"
)

var config = flag.String("conf", "default", "config file")
var master = flag.Bool("master", false, "this is a master")
var game = flag.Bool("game", false, "this is a game mechanic")
var database = flag.Bool("db", false, "this is a database")

var circuit = flag.String("c", "", "circuit address")

func main() {
	log.SetFlags(log.Ltime | log.Lmicroseconds | log.Lshortfile)
	flag.Parse()

	conf, err := ioutil.ReadFile(fmt.Sprintf("config/%s.yml", *config))
	if err != nil {
		log.Panicln("Fail load config file", err)
	}

	switch {
	case *master:
		module := oni.NewMaster()
		// configure
		if err := yaml.Unmarshal(conf, &module); err != nil {
			log.Panicln("[master] Fail unmarshal config file", err)
		}
		module.Run()
	case *game:
		module := oni.NewGame()
		// configure
		if err := yaml.Unmarshal(conf, &module); err != nil {
			log.Panicln("[game] Fail unmarshal config file", err)
		}
		module.Run()
		//log.Println("run GAME:", *addr, "rpc:", *rpc)
	case *database:
		// TODO run database
		//log.Println("run DATABASE:", *addr, "rpc:", *rpc)
	default:
		module := oni.NewMaster()
		// configure
		if err := yaml.Unmarshal(conf, &module); err != nil {
			log.Panicln("[master] Fail unmarshal config file", err)
		}
		balancer := oni.NewBalancer("")
		go module.Run()
		balancer.Game.Run()
	}
}
