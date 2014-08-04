package mechanic

import (
	"database/sql"
	"github.com/coopernurse/gorp"
	_ "github.com/mattn/go-sqlite3"
	"log"
	//"time"
)

var db = &DB{}

type DB struct {
	db     *sql.DB
	dbmap  *gorp.DbMap
	States []*State
	Skills []*Skill
}

func NewDB(driver, source string) (db *DB) {
	driver = "sqlite3"
	source = "test_db.bin"

	var err error
	db.db, err = sql.Open(driver, source)
	if err != nil {
		log.Fatalln("sql.Open failed", err)
	}

	db.dbmap = &gorp.DbMap{Db: db.db, Dialect: gorp.SqliteDialect{}}

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

/*
func main() {
	// initialize the DbMap
	dbmap := initDb()
	defer dbmap.Db.Close()

	// delete any existing rows
	err := dbmap.TruncateTables()
	checkErr(err, "TruncateTables failed")

	// create two posts
	p1 := newPost("Go 1.1 released!", "Lorem ipsum lorem ipsum")
	p2 := newPost("Go 1.2 released!", "Lorem ipsum lorem ipsum")

	// insert rows - auto increment PKs will be set properly after the insert
	err = dbmap.Insert(&p1, &p2)
	checkErr(err, "Insert failed")

	// use convenience SelectInt
	count, err := dbmap.SelectInt("select count(*) from posts")
	checkErr(err, "select count(*) failed")
	log.Println("Rows after inserting:", count)

	// update a row
	p2.Title = "Go 1.2 is better than ever"
	count, err = dbmap.Update(&p2)
	checkErr(err, "Update failed")
	log.Println("Rows updated:", count)

	// fetch one row - note use of "post_id" instead of "Id" since column is aliased
	//
	// Postgres users should use $1 instead of ? placeholders
	// See 'Known Issues' below
	//
	err = dbmap.SelectOne(&p2, "select * from posts where post_id=?", p2.Id)
	checkErr(err, "SelectOne failed")
	log.Println("p2 row:", p2)

	// fetch all rows
	var posts []Post
	_, err = dbmap.Select(&posts, "select * from posts order by post_id")
	checkErr(err, "Select failed")
	log.Println("All rows:")
	for x, p := range posts {
		log.Printf("    %d: %v\n", x, p)
	}

	// delete row by PK
	count, err = dbmap.Delete(&p1)
	checkErr(err, "Delete failed")
	log.Println("Rows deleted:", count)

	// delete row manually via Exec
	_, err = dbmap.Exec("delete from posts where post_id=?", p2.Id)
	checkErr(err, "Exec failed")

	// confirm count is zero
	count, err = dbmap.SelectInt("select count(*) from posts")
	checkErr(err, "select count(*) failed")
	log.Println("Row count - should be zero:", count)

	log.Println("Done!")
}

type Post struct {
	// db tag lets you specify the column name if it differs from the struct field
	Id      int64 `db:"post_id"`
	Created int64
	Title   string
	Body    string
}

func newPost(title, body string) Post {
	return Post{
		Created: time.Now().UnixNano(),
		Title:   title,
		Body:    body,
	}
}

func checkErr(err error, msg string) {
	if err != nil {
		log.Fatalln(msg, err)
	}
}*/
