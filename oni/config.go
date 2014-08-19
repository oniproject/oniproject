package oni

import (
	"fmt"
	"github.com/jinzhu/gorm"
	_ "github.com/lib/pq"
	_ "github.com/mattn/go-sqlite3"
	"gopkg.in/yaml.v1"
	"io/ioutil"
	"log"
)

type Config struct {
	Driver string
	Db     string
	Addr   string
	db     *gorm.DB
}

func NewConfig(config string) (c *Config) {
	file, err := ioutil.ReadFile(fmt.Sprintf("config/%s.yml", config))
	if err != nil {
		log.Panicln("Fail load config file", err)
	}

	c = &Config{}
	err = yaml.Unmarshal(file, c)
	if err != nil {
		log.Panicln("Fail unmarshal config file", err)
	}

	return
}

func (c *Config) DB() *gorm.DB {
	if c.db != nil {
		return c.db
	}

	db, err := gorm.Open(c.Driver, c.Db)
	if err != nil {
		log.Panicln("Fail connect to db", c.Driver, c.Db, "ERROR:", err)
	}

	db.LogMode(true)

	c.db = &db
	return &db
}
