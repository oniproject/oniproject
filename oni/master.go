package oni

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/sessions"
	"html/template"
	"log"
	"net/http"
	"strconv"
)

type Master struct {
	Addr, Rpc             string
	homeTempl, loginTempl *template.Template
}

func NewMaster() *Master {
	return &Master{
		homeTempl:  template.Must(template.ParseFiles("templates/index.html")),
		loginTempl: template.Must(template.ParseFiles("templates/login.html")),
	}
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
		//pass := r.PostFormValue("password")

		// TODO auth

		auth, err := store.Get(r, "auth")
		if err != nil {
			http.Error(w, http.StatusText(504), 504)
			log.Println(err)
			return
		}

		var x struct {
			//Id   uint64
			Id   string
			Host string
		}
		x.Host = "localhost:2000"

		if id, err := strconv.ParseUint(login, 16, 64); err != nil {
			http.Error(w, http.StatusText(504), 504)
			log.Println(err)
			return
		} else {
			id_ := NewAvatarId(id)
			log.Printf("%b", id_)
			auth.Values["id"] = uint64(id_)
			x.Id = id_.String()
		}
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
