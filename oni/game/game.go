package game

import (
	"errors"
	log "github.com/Sirupsen/logrus"
	"github.com/go-martini/martini"
	"github.com/gorilla/websocket"
	"github.com/martini-contrib/sessions"
	"net/http"
	. "oniproject/oni/utils"
	"time"
)

type AvatarDB interface {
	AvatarById(Id) (*Avatar, error)
	SaveAvatar(*Avatar) error
}

type GameAddr interface {
	GameAddr() string
}

type Game struct {
	maps map[string]*Map
	adb  AvatarDB
}

func NewGame(adb AvatarDB) *Game {
	game := &Game{
		adb:  adb,
		maps: make(map[string]*Map),
	}
	//game.Map = NewMap(game)
	return game
}

func (gm *Game) Run(addr string) {
	log.Println("run GAME:", addr)

	// TODO: init RPC

	//go gm.Map.Run()
	// run http server

	m := martini.Classic()
	m.Map(CreateMartiniLogger())

	store := sessions.NewCookieStore([]byte("secret123"))
	store.Options(sessions.Options{Path: "/", MaxAge: 86400 * 30, HttpOnly: true})
	m.Use(sessions.Sessions("ssid", store))

	m.Get("/ws", func(sessions sessions.Session, w http.ResponseWriter, r *http.Request) (int, string) {
		_id := sessions.Get("id")
		if _id == nil {
			log.Warn("Unauthorized ", sessions)
			return 401, "Unauthorized"
		}
		id := _id.(int64)
		log.Debug("_ID ", _id, " id ", id)

		ws, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Error(err)
			if _, ok := err.(websocket.HandshakeError); !ok {
				return 500, "fail HandshakeError"
			}
			return 418, http.StatusText(418)
		}

		a, err := gm.adb.AvatarById(Id(id))
		if err != nil {
			log.Error("get avatar", err)
			return 500, http.StatusText(418)
		}

		a.Connection = Connection{
			ws:          ws,
			sendMessage: make(chan Message, 2560),
			ping_pong:   time.Now(),
		}
		log.Debug(a)

		m, ok := gm.maps[a.MapId]
		if !ok {
			log.Panicln("map notfound", a.MapId, gm.maps)
		}
		m.RunAvatar(ws, a)

		return 200, "game over"
	})

	http.Handle("/ws", m)

	if addr != "" {
		err := http.ListenAndServe(addr, nil)
		if err != nil {
			log.Fatal("ListenAndServe: ", err)
		}
	}
}

func (gm *Game) LoadMap(mapId *string, ret *struct{}) error {
	log.Println("LoadMap", *mapId)
	gm.maps[*mapId] = NewMap(gm, *mapId)

	go gm.maps[*mapId].Run()
	return nil
}

func (gm *Game) UnloadMap(mapId *string, ret *struct{}) error {
	delete(gm.maps, *mapId)
	log.Println("UnloadMap", *mapId)
	return nil
}

type DetachAvatarArgs struct {
	Id    Id
	MapId string
}

func (gm *Game) DetachAvatar(args *DetachAvatarArgs, ret *struct{}) error {
	obj := gm.maps[args.MapId].GetObjById(args.Id)
	if obj == nil {
		return errors.New("Avatar not found")
	}

	if avatar, ok := obj.(*Avatar); ok {
		gm.maps[args.MapId].Unregister(avatar)
		return nil
	}

	return errors.New("Avatar not found")
}
