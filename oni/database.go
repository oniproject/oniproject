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
	a.X, a.Y = 10, 35

	// XXX
	a.MapId = "test"
	a.AddSkill("screaming")
	a.HP, a.MHP, a.HRG = 90, 100, 1
	a.MP, a.MMP, a.MRG = 15, 50, 1
	a.TP, a.MTP, a.TRG = 25, 30, 1
	a.ATK = 15
	a.DEF = 10
	a.AddItem("hauberk", 0, 0)
	log.Debug(a.EquipItem(0, 0))
	a.AddItem("bow", 0, 0)
	log.Debug(a.EquipItem(0, 0))
	a.Nickname = "Avatar"

	err := db.db.Save(a).Error
	return a, err
}
