package oni

import "github.com/jinzhu/gorm"

type Account struct {
	Id       int64    `db:"id" form:"-"`
	Username string   `db:"login" form:"login"`
	Password string   `db:"password" form:"password"`
	AvatarId int64    `db:"avatar_id" form:"-"`
	auth     bool     `db:"-" form:"-"`
	dbmap    *gorm.DB `db:"-" form:"-"`
}

func (a *Account) IsAuthenticated() bool { return a.auth }
func (a *Account) Login()                { a.auth = true }
func (a *Account) Logout()               { a.auth = false }
func (a *Account) UniqueId() interface{} { return a.Id }
func (a *Account) GetById(id interface{}) (err error) {
	return a.dbmap.First(a, map[string]interface{}{"id": id}).Error
}
