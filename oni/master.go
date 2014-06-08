package oni

import (
	"log"
	"net/http"
	"text/template"
)

var homeTempl = template.Must(template.ParseFiles("templates/index.html"))

type Master struct {
	addr, rpc string
}

func NewMaster(addr string, rpc string) *Master {
	return &Master{
		addr: addr,
		rpc:  rpc,
	}
}

func (m *Master) Run() {
	log.Println("run MASTER:", m.addr, "rpc:", m.rpc)

	// init RPC

	// run http server
	http.Handle("/", m)
	err := http.ListenAndServe(m.addr, nil)
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
		homeTempl.Execute(w, m)
	default:
		http.Error(w, "Not found", 404)
	}
}
