package managers

import (
	. "github.com/smartystreets/goconvey/convey"
	. "oniproject/oni/artemis"
	"testing"
)

func Test_TeamManager(t *testing.T) {
	mgr := NewTeamManager()
	player := "player"
	team := "super power team"

	Convey("should implement Manager", t, func() {
		var i interface{} = mgr
		_, ok := i.(Manager)
		So(ok, ShouldBeTrue)
	})

	Convey("add to team", t, func() {
		mgr.SetTeam(player, team)
		So(mgr.Team(player), ShouldEqual, team)
	})

	Convey("players in team", t, func() {
		So(mgr.Players(team), ShouldContain, player)
	})

	Convey("remove from team", t, func() {
		mgr.RemoveFromTeam(player)
		So(mgr.Team(player), ShouldNotEqual, team)
		So(mgr.Players(team), ShouldNotContain, player)
	})
}

func Test_TagManager(t *testing.T) {
	mgr := NewTagManager()
	e := &Entity{}
	tag := "PITBOSS"

	Convey("should implement Manager", t, func() {
		var i interface{} = mgr
		_, ok := i.(Manager)
		So(ok, ShouldBeTrue)
	})

	Convey("register tag", t, func() {
		mgr.Register(tag, e)
		So(mgr.IsRegister(tag), ShouldBeTrue)
		So(mgr.EntityByTag(tag), ShouldEqual, e)
	})

	Convey("check all tags", t, func() {
		So(mgr.RegisteredTags(), ShouldContain, tag)
	})

	Convey("unregister tag", t, func() {
		mgr.Unregister(tag)
		So(mgr.IsRegister(tag), ShouldBeFalse)
		So(mgr.EntityByTag(tag), ShouldBeNil)
	})
}

func Test_PlayerManager(t *testing.T) {
	mgr := NewPlayerManager()
	e := &Entity{}
	player := "lol"

	Convey("should implement Manager", t, func() {
		var i interface{} = mgr
		_, ok := i.(Manager)
		So(ok, ShouldBeTrue)
	})

	Convey("set player", t, func() {
		mgr.SetPlayer(e, player)
		So(mgr.PlayerByEntity(e), ShouldEqual, player)
		So(mgr.EntitiesOfPlayer(player), ShouldContain, e)
	})

	Convey("remove from player", t, func() {
		Println(mgr)
		mgr.RemoveFromPlayer(e)
		Println(mgr.playerByEntity)
		So(mgr.PlayerByEntity(e), ShouldEqual, "")
		So(mgr.EntitiesOfPlayer(player), ShouldNotContain, e)
	})
}

func Test_GroupManager(t *testing.T) {
	mgr := NewGroupManager()
	e := &Entity{}
	group := "awesome"

	Convey("should implement Manager", t, func() {
		var i interface{} = mgr
		_, ok := i.(Manager)
		So(ok, ShouldBeTrue)
	})

	Convey("add group", t, func() {
		mgr.Add(e, group)
		So(mgr.IsInAnyGroup(e), ShouldBeTrue)
		So(mgr.IsInGroup(e, group), ShouldBeTrue)
		So(mgr.GroupsByEntity(e), ShouldContain, group)
	})

	Convey("rm group", t, func() {
		mgr.Remove(e, group)
		So(mgr.IsInAnyGroup(e), ShouldBeFalse)
		So(mgr.IsInGroup(e, group), ShouldBeFalse)
		So(mgr.GroupsByEntity(e), ShouldNotContain, group)
	})

	Convey("rm all group", t, func() {
		mgr.Add(e, group)
		mgr.Add(e, "lol")
		mgr.Add(e, "fuck")
		mgr.RemoveFromAllGroups(e)
		So(mgr.IsInAnyGroup(e), ShouldBeFalse)
		So(mgr.IsInGroup(e, group), ShouldBeFalse)
		So(mgr.GroupsByEntity(e), ShouldBeEmpty)
	})
}
