package oni

import (
	"github.com/go-martini/martini"
	"github.com/gorilla/websocket"
	"github.com/martini-contrib/sessions"
	"log"
	"net/http"
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

	m := martini.Classic()

	store := sessions.NewCookieStore([]byte("secret123"))
	m.Use(sessions.Sessions("my_session", store))

	m.Get("/ws", func(sessions sessions.Session, w http.ResponseWriter, r *http.Request) (int, string) {
		_id := sessions.Get("id")
		if _id == nil {
			return 401, "Unauthorized"
		}
		id := _id.(int64)

		ws, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println(err)
			if _, ok := err.(websocket.HandshakeError); !ok {
				return 500, "fail HandshakeError"
			}
			return 418, http.StatusText(418)
		}

		gm.Map.RunAvatar(ws, AvatarData{Id: id, X: 1, Y: 1})

		return 200, "game over"
	})

	http.Handle("/ws", m)

	err := http.ListenAndServe(gm.Addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func (gm *Game) LoadMap(id Id) {
	log.Println("LoadMap", id)
}
func (gm *Game) UnloadMap(id Id) {
	log.Println("UnloadMap", id)
}
