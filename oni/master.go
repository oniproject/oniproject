package oni

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
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
		if r.Method != "GET" {
			http.Error(w, "Method nod allowed", 405)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		m.homeTempl.Execute(w, m)
	case "/login":
		if r.Method == "GET" {
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			m.loginTempl.Execute(w, m)
		} else if r.Method == "POST" {
			auth, err := store.New(r, "auth")
			if err != nil {
				http.Error(w, http.StatusText(504), 504)
				log.Println(err)
				return
			}
			auth.Values["id"] = uint64(1)
			auth.Save(r, w)
			r.ParseForm()
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			fmt.Fprintln(w, "POST", r.PostFormValue("login"), r.PostFormValue("password"))
		} else {
			http.Error(w, "Method nod allowed", 405)
		}
	default:
		http.Error(w, "Not found", 404)
	}
}
