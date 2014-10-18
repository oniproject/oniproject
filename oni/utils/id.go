package utils

type Id int64

func NewId(v int64) (id Id) {
	id = Id(v)
	id.SetIsAvatar(false)
	return
}
func NewAvatarId(v int64) (id Id) {
	id = Id(v)
	id.SetIsAvatar(true)
	return
}

func (id Id) IsAvatar() bool {
	return id > 0
}
func (id *Id) SetIsAvatar(value bool) {
	if value && *id < 0 {
		*id = -*id
	} else if !value && *id > 0 {
		*id = -*id
	}
}
