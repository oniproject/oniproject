package main

import (
	"flag"
	log "github.com/Sirupsen/logrus"
	"io"
	stdlog "log"
	"net"
	"net/rpc"
	"oniproject/oni"
	"oniproject/oni/game"
	"os"
	"os/signal"
	"runtime/pprof"
	"syscall"
)

var config = flag.String("conf", "../data/config.yml", "config file")

var masterService = flag.Bool("master", false, "this is a master")
var gameService = flag.Bool("game", false, "this is a game mechanic")

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
	case *masterService:
		db := oni.NewDatabase(conf)
		balancer := oni.NewBalancer(conf, db)
		go oni.NewMaster(conf, balancer).Run()

	case *gameService:
		db := oni.NewDatabase(conf)
		_ = spawnGame(conf.Games[0].Addr, conf.Games[0].Rpc, db)

	default:
		db := oni.NewDatabase(conf)
		balancer := oni.NewBalancer(conf, db)
		pipe := spawnGame("", conf.Games[0].Rpc, db)
		conf.Games[0].FakePipe = pipe
		go oni.NewMaster(conf, balancer).Run()
	}

	ch := make(chan os.Signal)
	signal.Notify(ch, syscall.SIGINT, syscall.SIGTERM)
	log.Error(<-ch)
}

func spawnGame(addr string, rpcAddr string, db oni.AvatarDB) io.ReadWriteCloser {
	g := game.NewGame(db)
	go g.Run(addr)

	rpcServer := rpc.NewServer()
	if err := rpcServer.Register(g); err != nil {
		log.Fatal(err)
	}

	if rpcAddr != "" {
		l, err := net.Listen("tcp", rpcAddr)
		if err != nil {
			log.Fatal("listen error:", err)
		}
		go rpcServer.Accept(l)
		return nil
	} else {
		p := &ping{}
		rpcServer.ServeConn(p)
		return p
	}
}

type ping []byte

func (pp *ping) Read(p []byte) (n int, err error) {
	buf := []byte(*pp)
	for ; n < len(buf); /*&& n < len(p)*/ n++ {
		p = append(p, buf[n])
	}
	return
}

func (pp *ping) Write(p []byte) (n int, err error) {
	*pp = append(*pp, p...)
	return len(p), nil
}
func (pp *ping) Close() (err error) { return }
