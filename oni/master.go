package oni

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/coopernurse/gorp"
	"github.com/gorilla/sessions"
	_ "github.com/mattn/go-sqlite3"
	"html/template"
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
	Addr, Rpc             string
	homeTempl, loginTempl *template.Template
	authdb                *gorp.DbMap
	balancer              *Balancer
}

func NewMaster(balancer *Balancer) *Master {
	m := &Master{
		homeTempl:  template.Must(template.ParseFiles("templates/index.html")),
		loginTempl: template.Must(template.ParseFiles("templates/login.html")),
		balancer:   balancer,
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

func (m *Master) Run() {
	log.Println("run MASTER:", m.Addr, "rpc:", m.Rpc)

	// TODO: init RPC

	// run http server
	http.Handle("/", m)
	http.Handle("/public/", http.StripPrefix("/public/", http.FileServer(http.Dir("./public"))))
	err := http.ListenAndServe(m.Addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func (m *Master) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch r.URL.Path {
	case "/":
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		auth, _ := store.Get(r, "auth")
		fmt.Fprintln(w, "index", auth.Values)
	case "/game":
		if r.Method != "GET" {
			http.Error(w, http.StatusText(405), 405)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		m.homeTempl.Execute(w, m)
	case "/logout":
		if r.Method != "GET" {
			http.Error(w, "Method nod allowed", 405)
			return
		}
		auth, err := store.Get(r, "auth")
		if err != nil {
			http.Error(w, http.StatusText(504), 504)
			log.Println(err)
			return
		}
		delete(auth.Values, "id")
		sessions.Save(r, w)
	case "/login":
		m.login(w, r)
	default:
		http.Error(w, "Not found", 404)
	}
}

func (m *Master) login(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		m.loginTempl.Execute(w, m)
	} else if r.Method == "POST" {
		r.ParseForm()
		login := r.PostFormValue("login")
		pass := r.PostFormValue("password")

		var account Account
		if err := m.authdb.SelectOne(
			&account,
			"select * from accounts where login=:login",
			map[string]interface{}{"login": login}); err != nil {
			// TODO Auth err: notfound
			log.Println("auth notfound", err)
			return
		}

		// FIXME sault and hash pass
		if pass != account.Password {
			// TODO Auth err: fail pass
			log.Println("fail pass")
			return
		}

		auth, err := store.Get(r, "auth")
		if err != nil {
			http.Error(w, http.StatusText(504), 504)
			log.Println(err)
			return
		}

		x := struct {
			Id   int64
			Host string
		}{account.AvatarId, "localhost:2000"}

		a, err := m.balancer.AttachAvatar(Id(account.AvatarId))
		log.Println("AttachAvatar", a, err)

		auth.Values["id"] = account.AvatarId

		sessions.Save(r, w)
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		//http.Redirect(w, r, "/game", 301)

		s, _ := json.Marshal(x)
		//fmt.Fprint(w, "POST", login, pass)
		fmt.Fprint(w, string(s))
	} else {
		http.Error(w, http.StatusText(405), 405)
	}
}
