package main

import (
	"flag"
	log "github.com/Sirupsen/logrus"
	stdlog "log"
	"oniproject/oni"
	"os"
	"os/signal"
	"runtime/pprof"
	"syscall"
)

var config = flag.String("conf", "../data/config.yml", "config file")
var master = flag.Bool("master", false, "this is a master")
var game = flag.Bool("game", false, "this is a game mechanic")
var database = flag.Bool("db", false, "this is a database")

var cpuprofile = flag.String("cpuprofile", "", "write cpu profile to file")

var circuit = flag.String("c", "", "circuit address")

func main() {
	stdlog.SetFlags(stdlog.Llongfile)
	stdlog.SetPrefix("\033[01;07;38;05;196m[WAT?]\033[0m ")
	flag.Parse()

	if *cpuprofile != "" {
		f, err := os.Create(*cpuprofile)
		if err != nil {
			log.Fatal(err)
		}
		defer f.Close()

		pprof.StartCPUProfile(f)
		defer pprof.StopCPUProfile()
	}

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
	}

	ch := make(chan os.Signal)
	signal.Notify(ch, syscall.SIGINT, syscall.SIGTERM)
	log.Error(<-ch)
}
