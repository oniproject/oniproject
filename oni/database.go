package oni

import (
	"database/sql"
	"github.com/coopernurse/gorp"
	_ "github.com/mattn/go-sqlite3"
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

func (db *Database) AvatarDataById(id Id) (a AvatarData, err error) {
	a = AvatarData{}
	// TODO choice database by Id
	err = db.dbmap.SelectOne(
		&a, "select * from avatars where id=:id",
		map[string]interface{}{"id": id})
	log.Println("AvatarDataById", a, err)
	if err != nil {
		log.Println("SelectOne failed", err)
	}
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
