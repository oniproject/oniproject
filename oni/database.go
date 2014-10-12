package oni

import (
	log "github.com/Sirupsen/logrus"
	"github.com/jinzhu/gorm"
	"oniproject/oni/game"
	"oniproject/oni/utils"
)

type AvatarDB interface {
	AvatarById(id utils.Id) (*game.Avatar, error)
	SaveAvatar(a *game.Avatar) error
	CreateAvatar() (*game.Avatar, error)
}

type Database struct {
	db *gorm.DB
}

func NewDatabase(config *Config) AvatarDB {
	db := &Database{db: config.DB()}

	db.db.AutoMigrate(&game.Avatar{})

	return db
}

func (db *Database) AvatarById(id utils.Id) (*game.Avatar, error) {
	// TODO choice database by Id
	a := game.NewAvatar()
	//err := db.db.First(&a, map[string]interface{}{"id": id}).Error
	err := db.db.First(a, int64(id)).Error
	if err != nil {
		log.Error("SelectOne failed", err)
		return nil, err
	}
	return a, nil
	// TODO sync AvatarData with mechanic database ?
}

func (db *Database) SaveAvatar(a *game.Avatar) error {
	return db.db.Save(a).Error
}

func (db *Database) CreateAvatar() (*game.Avatar, error) {
	a := game.NewAvatar()
	a.X, a.Y = 2, 2
	err := db.db.Save(a).Error
	return a, err
}
