package oni

import (
	"html/template"
	"log"
	"net/http"
)

type Master struct {
	Addr, Rpc string
	homeTempl *template.Template
}

func NewMaster() *Master {
	return &Master{
		homeTempl: template.Must(template.ParseFiles("templates/index.html")),
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
	default:
		http.Error(w, "Not found", 404)
	}
}
