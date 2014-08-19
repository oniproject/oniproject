package oni

import (
	"github.com/go-martini/martini"
	"github.com/jinzhu/gorm"
	"github.com/martini-contrib/binding"
	"github.com/martini-contrib/render"
	"github.com/martini-contrib/sessionauth"
	"github.com/martini-contrib/sessions"
	_ "github.com/mattn/go-sqlite3"
	"log"
	"net/http"
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

	store := sessions.NewCookieStore([]byte("secret123"))
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

	m.Get("/redactor", func(user sessionauth.User, r render.Render) {
		r.HTML(200, "redactor", map[string]interface{}{"title": "Redactor"}, render.HTMLOptions{""})
	})

	m.Get("/game", sessionauth.LoginRequired, func(r render.Render) {
		r.HTML(200, "game", map[string]interface{}{"title": "Game"}, render.HTMLOptions{""})
	})

	m.Post("/game", sessionauth.LoginRequired, func(user sessionauth.User, r render.Render) {
		account := user.(*Account)
		a, err := master.balancer.AttachAvatar(Id(account.AvatarId))
		log.Println("AttachAvatar", a, err)
		x := struct {
			Id   int64
			Host string
		}{account.AvatarId, "localhost:2000"}
		r.JSON(200, x)
	})

	m.Get("/logout", sessionauth.LoginRequired, func(session sessions.Session, user sessionauth.User, r render.Render) {
		sessionauth.Logout(session, user)
		session.Clear()
		r.Redirect("/")
	})

	m.Get("/login", func(r render.Render) {
		r.HTML(200, "login", map[string]interface{}{"title": "Login"})
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

		session.Set("id", account.AvatarId)
		session.Set("username", account.Username)

		params := req.URL.Query()
		log.Println(params, req.URL)
		redirect := params.Get(sessionauth.RedirectParam)
		r.Redirect(redirect)
	})

	m.Get("/signup", func(r render.Render) {
		r.HTML(200, "signup", map[string]interface{}{"title": "Sign-up"})
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

		account.AvatarId = actor.Id

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
