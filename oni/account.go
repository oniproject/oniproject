package oni

import "github.com/jinzhu/gorm"

type Account struct {
	Id       int64    `form:"-"`
	Username string   `form:"login"`
	Password string   `form:"password"`
	AvatarId int64    `form:"-"`
	auth     bool     `sql:"-" form:"-"`
	dbmap    *gorm.DB `sql:"-" form:"-"`
}

func (a *Account) IsAuthenticated() bool { return a.auth }
func (a *Account) Login()                { a.auth = true }
func (a *Account) Logout()               { a.auth = false }
func (a *Account) UniqueId() interface{} { return a.Id }
func (a *Account) GetById(id interface{}) (err error) {
	return a.dbmap.First(a, map[string]interface{}{"id": id}).Error
}
