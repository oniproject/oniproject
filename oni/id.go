package oni

import "strconv"

type Id uint64

func NewAvatarId(v uint64) (id Id) {
	id = Id(v)
	id.SetIsAvatar(true)
	return
}

// FIXME string is to long
func (id Id) String() string {
	return strconv.FormatUint(uint64(id), 16)
}

func (id Id) IsAvatar() bool {
	return (id>>63)&1 == 1
}
func (id *Id) SetIsAvatar(value bool) {
	id.setIs(value, 63)
}

func (id *Id) setIs(value bool, offset uint) {
	if value {
		*id |= 1 << offset
	} else {
		*id ^= 1 << offset
	}
}
