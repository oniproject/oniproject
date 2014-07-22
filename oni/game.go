package oni

import (
	"github.com/gorilla/sessions"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
)

var store = sessions.NewFilesystemStore(
	"./tmp",
	[]byte("auth"),
	nil,
)

type Game struct {
	Addr, Rpc string
	Map       *Map
}

func NewGame() *Game {
	return &Game{Map: NewMap()}
}

func (gm *Game) Run() {
	log.Println("run GAME:", gm.Addr, "rpc:", gm.Rpc)

	// TODO: init RPC

	go gm.Map.Run()
	// run http server
	http.Handle("/ws", gm)
	err := http.ListenAndServe(gm.Addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func (gm *Game) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Get a session and set a value.
	auth, err := store.Get(r, "auth")
	if err != nil {
		http.Error(w, http.StatusText(401), 401)
		log.Println("Unauthorized (fail session)", err)
		return
	}
	var id uint64
	if n, ok := auth.Values["id"].(uint64); !ok {
		http.Error(w, http.StatusText(401), 401)
		log.Println("Unauthorized fail id", n, auth.Values["id"])
		return
	} else {
		id = n
	}

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		if _, ok := err.(websocket.HandshakeError); !ok {
			http.Error(w, http.StatusText(418), 418)
			log.Println(err)
		}
		return
	}

	gm.Map.RunAvatar(ws, AvatarData{Id: Id(id), Position: Point{1, 1}})
}
