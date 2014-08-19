package oni

import (
	"github.com/jinzhu/gorm"
	"log"
	"oniproject/oni/mechanic"
)

type AvatarDB interface {
	AvatarById(id Id) (*mechanic.Actor, error)
	SaveAvatar(a *mechanic.Actor) error
	CreateAvatar() (*mechanic.Actor, error)
}

type Database struct {
	db *gorm.DB
}

func NewDatabase(config *Config) (db *Database) {
	db = &Database{db: config.DB()}

	db.db.AutoMigrate(&mechanic.Actor{})

	return
}

func (db *Database) AvatarById(id Id) (*mechanic.Actor, error) {
	// TODO choice database by Id
	var a mechanic.Actor
	err := db.db.First(&a, map[string]interface{}{"id": id}).Error
	if err != nil {
		log.Println("SelectOne failed", err)
		return nil, err
	}
	return &a, nil
	// TODO sync AvatarData with mechanic database ?
}

func (db *Database) SaveAvatar(a *mechanic.Actor) error {
	return db.db.Save(a).Error
}

func (db *Database) CreateAvatar() (*mechanic.Actor, error) {
	var a mechanic.Actor
	a.X, a.Y = 1, 1
	err := db.db.Save(&a).Error
	return &a, err
}
