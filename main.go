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
	"syscall"
)

var config = flag.String("conf", "../data/config.yml", "config file")

var masterService = flag.Bool("master", false, "this is a master")
var gameService = flag.Bool("game", false, "this is a game mechanic")

var circuit = flag.String("c", "", "circuit address")

func main() {
	stdlog.SetFlags(stdlog.Llongfile)
	stdlog.SetPrefix("\033[01;07;38;05;196m[WAT?]\033[0m ")
	flag.Parse()

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
		log.Println("try run with fake pipe")
		r, w := io.Pipe()
		conn := pipe{r, w}

		go rpcServer.ServeConn(conn)
		return conn
	}
}

type pipe struct {
	reader *io.PipeReader
	writer *io.PipeWriter
}

func (pp pipe) Read(p []byte) (n int, err error) {
	n, err = pp.reader.Read(p)
	return
}

func (pp pipe) Write(p []byte) (n int, err error) {
	n, err = pp.writer.Write(p)
	return
}
func (pp pipe) Close() error {
	err := pp.reader.Close()
	err1 := pp.writer.Close()
	if err == nil {
		err = err1
	}
	return err
}
