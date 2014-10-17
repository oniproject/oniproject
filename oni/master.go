package oni

import (
	log "github.com/Sirupsen/logrus"
	"github.com/go-martini/martini"
	"github.com/jinzhu/gorm"
	"github.com/martini-contrib/binding"
	"github.com/martini-contrib/render"
	"github.com/martini-contrib/sessionauth"
	"github.com/martini-contrib/sessions"
	_ "github.com/mattn/go-sqlite3"
	"github.com/yosssi/ace"
	"github.com/yosssi/martini-acerender"
	"net/http"
	"oniproject/oni/utils"
)

type Master struct {
	Addr, Rpc string
	config    *Config
	balancer  *Balancer
	authdb    *gorm.DB
}

func NewMaster(config *Config, balancer *Balancer) *Master {
	m := &Master{
		balancer: balancer,
		config:   config,
		authdb:   config.DB(),
		Addr:     config.Addr,
	}

	m.authdb.AutoMigrate(Account{})

	return m
}

func (master *Master) Run() {
	log.Println("run MASTER:", master.Addr, "rpc:", master.Rpc)

	// TODO: init RPC

	m := martini.Classic()
	m.Map(utils.CreateMartiniLogger())
	m.Use(acerender.Renderer(&acerender.Options{AceOptions: &ace.Options{
		DynamicReload: true,
		BaseDir:       "templates",
	}}))

	store := sessions.NewCookieStore([]byte("secret123"))
	store.Options(sessions.Options{Path: "/", MaxAge: 86400 * 30, HttpOnly: true})
	m.Use(sessions.Sessions("ssid", store))
	m.Use(render.Renderer(render.Options{
		Layout: "layout",
	}))

	f := func() sessionauth.User { return &Account{dbmap: master.authdb} }
	m.Use(sessionauth.SessionUser(f))
	sessionauth.RedirectUrl = "/login"
	sessionauth.RedirectParam = "next"

	m.Get("/", func(user sessionauth.User, r render.Render) {
		args := map[string]interface{}{"title": "Main"}
		if user.IsAuthenticated() {
			args["user"] = user.(*Account)
		}
		r.HTML(200, "index", args)
	})

	m.Get("/game", sessionauth.LoginRequired, func(r acerender.Render) {
		r.HTML(200, "game", map[string]interface{}{"title": "Game"}, nil)
	})

	m.Post("/game", sessionauth.LoginRequired, func(user sessionauth.User, r render.Render) {
		account := user.(*Account)
		a, err := master.balancer.AttachAvatar(utils.Id(account.AvatarId))
		log.Println("AttachAvatar", a, err)
		x := struct {
			Id   int64
			Host string
			//}{account.AvatarId, "ngrok.com:49008"}
		}{account.AvatarId, "oniproject-lain.rhcloud.com:8000"}
		r.JSON(200, x)
	})

	m.Get("/avatar", sessionauth.LoginRequired, func(session sessions.Session, user sessionauth.User, r acerender.Render) {
		u := user.(*Account)
		avatar, _ := master.balancer.adb.AvatarById(utils.Id(u.AvatarId))
		r.HTML(200, "avatar", map[string]interface{}{
			"id":     session.Get("id"),
			"user":   user,
			"avatar": avatar,
		}, nil)
	})

	m.Get("/x", sessionauth.LoginRequired, func(session sessions.Session, user sessionauth.User, r render.Render) {
		r.JSON(200, map[string]interface{}{"user": user, "id": session.Get("id")})
	})

	m.Get("/logout", sessionauth.LoginRequired, func(session sessions.Session, user sessionauth.User, r render.Render) {
		sessionauth.Logout(session, user)
		session.Clear()
		r.Redirect("/")
	})

	m.Get("/login", func(r acerender.Render) {
		r.HTML(200, "login", map[string]interface{}{"Title": "Login", "IsLogin": true}, nil)
	})

	m.Post("/login", binding.Bind(Account{}), func(account Account, session sessions.Session, r render.Render, req *http.Request) {
		log.Println(account)

		err := master.authdb.First(&account, map[string]interface{}{"username": account.Username, "password": account.Password}).Error

		if err != nil {
			log.Println(err)
			//r.Redirect(sessionauth.RedirectUrl)
			x := struct {
				Error string
			}{err.Error()}
			r.JSON(401, x)
			// TODO check if pass only err
			return
		}

		err = sessionauth.AuthenticateSession(session, &account)
		if err != nil {
			r.JSON(500, err)
			return
		}

		log.Println("login account", account)

		session.Set("id", account.AvatarId)
		session.Set("username", account.Username)

		params := req.URL.Query()
		log.Println(params, req.URL, "AvatarId", session.Get("id"))
		redirect := params.Get(sessionauth.RedirectParam)
		r.Redirect(redirect)
	})

	m.Get("/signup", func(r acerender.Render) {
		r.HTML(200, "login", map[string]interface{}{"Title": "Sign-up", "IsLogin": false}, nil)
	})

	m.Post("/signup", binding.Bind(Account{}), func(account Account, session sessions.Session, r render.Render, req *http.Request) (int, string) {
		var acc Account

		err := master.authdb.First(&acc, map[string]interface{}{"username": account.Username}).Error

		if err == nil {
			return 418, http.StatusText(418)
		}
		if err != gorm.RecordNotFound {
			log.Println(err)
			return 500, err.Error()
		}

		actor, err := master.balancer.adb.CreateAvatar()
		if err != nil {
			return 500, err.Error()
		}

		account.AvatarId = int64(actor.Id())

		err = master.authdb.Create(&account).Error
		if err != nil {
			return 500, err.Error()
		}

		err = sessionauth.AuthenticateSession(session, &account)
		if err != nil {
			return 500, err.Error()
		}

		session.Set("id", account.AvatarId)
		session.Set("username", account.Username)

		params := req.URL.Query()
		log.Println(params, req.URL)
		redirect := params.Get(sessionauth.RedirectParam)
		r.Redirect(redirect)

		return 200, http.StatusText(200)
	})

	// run http server
	http.Handle("/", m)
	err := http.ListenAndServe(master.Addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
