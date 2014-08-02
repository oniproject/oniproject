package oni

import (
	"database/sql"
	"github.com/coopernurse/gorp"
	_ "github.com/mattn/go-sqlite3"
	//"github.com/skelterjohn/geom"
	"log"
	//"time"
)

type Database struct {
	db    *sql.DB
	dbmap *gorp.DbMap
}

func NewDatabase(driver, source string) (db *Database) {
	db = &Database{}
	switch driver {
	case "sqlite3":
		var err error
		db.db, err = sql.Open(driver, source)
		if err != nil {
			log.Fatalln("sql.Open failed", err)
		}
		db.dbmap = &gorp.DbMap{Db: db.db, Dialect: gorp.SqliteDialect{}}
	default:
		log.Fatalln("fail gorp driver", driver)
	}

	db.dbmap.AddTableWithName(AvatarData{}, "avatars").SetKeys(true, "Id")
	if err := db.dbmap.CreateTablesIfNotExists(); err != nil {
		log.Fatalln(err, "Create tables failed")
	}

	return
}

func (db *Database) Migrate() {
	t1 := AvatarData{X: 2, Y: 1, Id: 1}
	t2 := AvatarData{X: 2, Y: 1, Id: 2}
	if err := db.dbmap.Insert(&t1, &t2); err != nil {
		log.Fatalln(err, "Insert fail", err)
	}
}

func (db *Database) AvatarDataById(id Id) (a *AvatarData, err error) {
	// TODO choice database by Id
	obj, err := db.dbmap.Get(AvatarData{}, int64(id))
	if err != nil {
		log.Println("SelectOne failed", err)
		return
	}
	var data []AvatarData
	_, err = db.dbmap.Select(&data, "select * from avatars order by id")
	if err != nil {
		log.Println("Select failed", err)
		return
	}
	log.Println("All rows:")
	for x, p := range data {
		log.Printf("    %d: %v\n", x, p)
	}
	log.Println("AvatarDataById", obj, id)
	a = obj.(*AvatarData)
	log.Println("AvatarDataById", a, err)
	// TODO sync AvatarData with mechanic database
	return
}

func (db *Database) SaveAvatarData(a AvatarData) error {
	count, err := db.dbmap.Update(&a)
	if err != nil {
		log.Println("Update failed", err)
		return err
	}
	log.Println("Update AvatarData", count, a)
	return nil
}
