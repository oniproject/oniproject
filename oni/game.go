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
	Addr, Rpc            string
	tick                 uint
	avatars              map[*Avatar]bool
	register, unregister chan *Avatar
	broadcast            chan interface{}
}

func NewGame() (gm *Game) {
	gm = &Game{
		register:   make(chan *Avatar),
		unregister: make(chan *Avatar),
		avatars:    make(map[*Avatar]bool),
		broadcast:  make(chan interface{}),
	}
	return
}

func (gm *Game) replication() {
	type state_msg struct {
		Id    uint64        `json:"id"`
		Lag   time.Duration `json:"lag"`
		State State         `json:"state"`
		Tick  uint          `json:"tick"`
	}
	for avatar := range gm.avatars {
		if avatar == nil {
			continue
		}

		state := avatar.Update(TickRate)
		if state == nil {
			continue
		}

		var st state_msg
		st.Id = uint64(avatar.Id)
		st.State = *state
		st.Lag = avatar.Lag
		st.Tick = gm.tick

		gm.broadcast <- st
	}
}

func (gm *Game) Run() {
	log.Println("run GAME:", gm.Addr, "rpc:", gm.Rpc)
	send := func(c *Avatar, m interface{}) {
		select {
		case c.sendMessage <- m:
		default:
			delete(gm.avatars, c)
			close(c.sendMessage)
		}
	}

	go func() {
		t := time.NewTicker(TickRate)
		for {
			select {
			case <-t.C:
				gm.tick++
				gm.broadcast <- gm.tick

				gm.replication()
			}
		}
	}()

	// TODO: init RPC

	end := make(chan bool)
	// run http server
	go func() {
		http.Handle("/", gm)
		err := http.ListenAndServe(gm.Addr, nil)
		if err != nil {
			log.Fatal("ListenAndServe: ", err)
		}
		end <- true
	}()

	for {
		select {
		case <-end:
			break
		case c := <-gm.register:
			gm.avatars[c] = false
			log.Println("register", c)
		case c := <-gm.unregister:
			if gm.avatars[c] {
				delete(gm.avatars, c)
				close(c.sendMessage)
			}
			log.Println("unregister", c)
		case m := <-gm.broadcast:
			for c := range gm.avatars {
				send(c, m)
			}
		}
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

	// TODO load data
	data := AvatarData{Id: Id(id)}
	conn := AvatarConnection{
		game:        gm,
		ws:          ws,
		sendMessage: make(chan interface{}, 256),
		ping_pong:   time.Now(),
	}
	c := &Avatar{data, conn}

	gm.register <- c
	go c.writePump()
	c.readPump()
}
