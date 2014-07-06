package oni

import (
	"github.com/gorilla/sessions"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"time"
)

const (
	TickRate = 50 * time.Millisecond
)

var store = sessions.NewCookieStore(
	[]byte("auth"),
)

type Id uint64

type Game struct {
	Addr, Rpc string
	Map       Map
}

func NewGame() (gm *Game) {
	gm = &Game{
		Map: Map{
			register:   make(chan *Avatar),
			unregister: make(chan *Avatar),
			avatars:    make(map[*Avatar]bool),
			broadcast:  make(chan interface{}),
		},
	}
	return
}

/*func (gm *Game) replication() {
	var states []interface{}
	for avatar := range gm.avatars {
		if avatar == nil {
			continue
		}

		state := avatar.Update(gm.tick, TickRate)
		if state == nil {
			continue
		}

		states = append(states, state)
	}
	gm.broadcast <- states
}*/

func (gm *Game) Run() {
	log.Println("run GAME:", gm.Addr, "rpc:", gm.Rpc)

	// TODO: init RPC

	go gm.Map.Run()
	// run http server
	http.Handle("/", gm)
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
		log.Println(err)
		log.Println("Unauthorized (fail session)")
		return
	}
	var id uint64
	ok := false
	if id, ok = auth.Values["id"].(uint64); !ok {
		http.Error(w, http.StatusText(401), 401)
		log.Println("Unauthorized fail id", id, auth.Values["id"])
		return
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

	gm.Map.RunAvatar(ws, AvatarData{Id: Id(id)})
}
