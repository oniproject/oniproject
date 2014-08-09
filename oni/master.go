package oni

import (
	"database/sql"
	"encoding/json"
	"github.com/coopernurse/gorp"
	"github.com/go-martini/martini"
	"github.com/martini-contrib/binding"
	"github.com/martini-contrib/render"
	"github.com/martini-contrib/sessions"
	_ "github.com/mattn/go-sqlite3"
	"log"
	"net/http"
)

type Account struct {
	Id       int64  `db:"id"`
	Login    string `db:"login"`
	Password string `db:"password"`
	AvatarId int64  `db:"avatar_id"`
}

type Master struct {
	Addr, Rpc string
	authdb    *gorp.DbMap
	balancer  *Balancer
}

func NewMaster(balancer *Balancer) *Master {
	m := &Master{
		balancer: balancer,
	}

	db, err := sql.Open("sqlite3", "accounts.bin")
	if err != nil {
		log.Fatalln("sql.Open failed", err)
	}
	m.authdb = &gorp.DbMap{Db: db, Dialect: gorp.SqliteDialect{}}

	m.authdb.AddTableWithName(Account{}, "accounts").SetKeys(true, "Id")
	if err := m.authdb.CreateTablesIfNotExists(); err != nil {
		log.Fatalln(err, "Create tables failed")
	}

	return m
}

func (m *Master) Migrate() {
	t1 := Account{Login: "t1", AvatarId: 1}
	t2 := Account{Login: "t2", AvatarId: 2}
	m.authdb.Insert(&t1, &t2)
}

func (master *Master) Run() {
	log.Println("run MASTER:", master.Addr, "rpc:", master.Rpc)

	// TODO: init RPC

	m := martini.Classic()

	store := sessions.NewCookieStore([]byte("secret123"))
	m.Use(sessions.Sessions("my_session", store))
	m.Use(render.Renderer(render.Options{
		Layout: "layout",
	}))

	m.Get("/", func(session sessions.Session) string {
		v := session.Get("username")
		if v == nil {
			return "fail username"
		}
		return v.(string)
	})

	m.Get("/game", func(r render.Render) { r.HTML(200, "index", nil) })

	m.Post("/logout", func(session sessions.Session) {
		session.Clear()
		return
	})

	m.Get("/login", func(r render.Render) { r.HTML(200, "login", nil) })

	type login struct {
		Login    string `form:"login" binding:"required"`
		Password string `form:"password"`
	}

	m.Post("/login", binding.Bind(login{}), func(l login, sessions sessions.Session) string {
		log.Println(l)

		var account Account
		if err := master.authdb.SelectOne(
			&account,
			"select * from accounts where login=:login",
			map[string]interface{}{"login": l.Login}); err != nil {
			// TODO Auth err: notfound
			log.Println("auth notfound", err)
			return "ERR"
		}

		// FIXME sault and hash pass
		if l.Password != account.Password {
			// TODO Auth err: fail pass
			log.Println("fail pass")
			return "fail pass"
		}

		x := struct {
			Id   int64
			Host string
		}{account.AvatarId, "localhost:2000"}

		a, err := master.balancer.AttachAvatar(Id(account.AvatarId))
		log.Println("AttachAvatar", a, err)

		sessions.Set("id", account.AvatarId)
		sessions.Set("username", account.Login)

		s, _ := json.Marshal(x)
		return string(s)
	})

	// run http server
	http.Handle("/", m)
	err := http.ListenAndServe(master.Addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
