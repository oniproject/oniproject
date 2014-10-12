package oni

import (
	log "github.com/Sirupsen/logrus"
	"github.com/jinzhu/gorm"
	"oniproject/oni/game"
	"oniproject/oni/utils"
)

type AvatarDB interface {
	AvatarById(id utils.Id) (*game.Actor, error)
	SaveAvatar(a *game.Actor) error
	CreateAvatar() (*game.Actor, error)
}

type Database struct {
	db *gorm.DB
}

func NewDatabase(config *Config) AvatarDB {
	db := &Database{db: config.DB()}

	db.db.AutoMigrate(&game.Actor{})

	return db
}

func (db *Database) AvatarById(id utils.Id) (*game.Actor, error) {
	// TODO choice database by Id
	var a game.Actor
	err := db.db.First(&a, map[string]interface{}{"id": id}).Error
	if err != nil {
		log.Println("SelectOne failed", err)
		return nil, err
	}
	return &a, nil
	// TODO sync AvatarData with mechanic database ?
}

func (db *Database) SaveAvatar(a *game.Actor) error {
	return db.db.Save(a).Error
}

func (db *Database) CreateAvatar() (*game.Actor, error) {
	var a game.Actor
	a.X, a.Y = 1, 1
	err := db.db.Save(&a).Error
	return &a, err
}
