package game

import (
	"database/sql"
	"github.com/coopernurse/gorp"
	_ "github.com/mattn/go-sqlite3"
	"log"
	//"time"
)

var db = NewDB("", "")

type DB struct {
	db     *sql.DB
	dbmap  *gorp.DbMap
	States []*ActorState
	Skills []*Skill
}

func NewDB(driver, source string) (db *DB) {
	db = &DB{
		States: []*ActorState{},
		Skills: []*Skill{},
	}

	driver = "sqlite3"
	source = "test_db.bin"

	var err error
	db.db, err = sql.Open(driver, source)
	if err != nil {
		log.Fatalln("sql.Open failed", err)
	}

	dbmap := &gorp.DbMap{Db: db.db, Dialect: gorp.SqliteDialect{}}
	db.dbmap = dbmap

	dbmap.AddTableWithName(Skill{}, "skills")
	dbmap.AddTableWithName(ActorState{}, "states")
	if err := dbmap.CreateTablesIfNotExists(); err != nil {
		log.Fatalln("Create tables failed:", err)
	}

	if _, err := dbmap.Select(&db.Skills, "select * from skills"); err != nil {
		log.Fatalln("Select skills failed:", err)
	}
	if _, err := dbmap.Select(&db.States, "select * from states"); err != nil {
		log.Fatalln("Select states failed:", err)
	}

	return
}

func (db *DB) Migrate() {
	/*db.dbmap.AddTableWithName(Post{}, "posts").SetKeys(true, "Id")
	err = db.dbmap.CreateTablesIfNotExists()
	if err != nil {
		log.Fatalln(err, "Create tables failed")
	}*/
}

/*
func (db *DB) FindActorById(id int64) (a *Actor, err error) {
	a = *Actor{}
	err = dbmap.SelectOne(
		a, "select * from actors where post_id=:id",
		map[string]interface{}{"id": id})
	log.Println("Actor", a, err)
	if err != nil {
		a = nil
		log.Println("SelectOne failed", err)
	}
}
*/
