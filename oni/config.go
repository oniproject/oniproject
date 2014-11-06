package oni

import (
	log "github.com/Sirupsen/logrus"
	"github.com/jinzhu/gorm"
	_ "github.com/lib/pq"
	_ "github.com/mattn/go-sqlite3"
	"gopkg.in/yaml.v1"
	"io/ioutil"
	"oniproject/oni/utils"
)

type Config struct {
	Driver  string
	Db      string
	Addr    string
	Circuit string
	Level   string
	Games   []*BalancerGame
	db      *gorm.DB
}

func NewConfig(config string) (c *Config) {
	file, err := ioutil.ReadFile(config)
	if err != nil {
		log.Panicln("Fail load config file", err)
	}

	c = &Config{}
	err = yaml.Unmarshal(file, c)
	if err != nil {
		log.Panicln("Fail unmarshal config file", err)
	}

	switch c.Level {
	case "panic":
		log.SetLevel(log.PanicLevel)
	case "fatal":
		log.SetLevel(log.FatalLevel)
	case "error":
		log.SetLevel(log.ErrorLevel)
	case "warn", "warning":
		log.SetLevel(log.WarnLevel)
	case "info":
		log.SetLevel(log.InfoLevel)
	case "debug":
		log.SetLevel(log.DebugLevel)
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
	db.SetLogger(utils.CreateGormLogger())

	c.db = &db
	return &db
}
