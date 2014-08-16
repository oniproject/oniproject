package oni

import "github.com/coopernurse/gorp"

type Account struct {
	Id       int64       `db:"id" form:"-"`
	Username string      `db:"login" form:"login"`
	Password string      `db:"password" form:"password"`
	AvatarId int64       `db:"avatar_id" form:"-"`
	auth     bool        `db:"-" form:"-"`
	dbmap    *gorp.DbMap `db:"-" form:"-"`
}

func (a *Account) IsAuthenticated() bool { return a.auth }
func (a *Account) Login()                { a.auth = true }
func (a *Account) Logout()               { a.auth = false }
func (a *Account) UniqueId() interface{} { return a.Id }
func (a *Account) GetById(id interface{}) (err error) {
	err = a.dbmap.SelectOne(a, "select * from accounts where id=:id",
		map[string]interface{}{"id": id})
	return
}
