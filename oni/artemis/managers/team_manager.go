package managers

import (
	. "oniproject/oni/artemis"
)

/* Use this class together with PlayerManager.

You may sometimes want to create teams in your game, so that
some players are team mates.

A player can only belong to a single team.
*/
type TeamManager struct {
	playersByTeam map[string][]string
	teamByPlayer  map[string]string
}

func NewTeamManager() *TeamManager {
	return &TeamManager{
		playersByTeam: make(map[string][]string),
		teamByPlayer:  make(map[string]string),
	}
}

func (m *TeamManager) Added(e *Entity)       {}
func (m *TeamManager) Changed(e *Entity)     {}
func (m *TeamManager) Deleted(e *Entity)     {}
func (m *TeamManager) Enabled(e *Entity)     {}
func (m *TeamManager) Disabled(e *Entity)    {}
func (m *TeamManager) SetWorld(world *World) {}
func (m *TeamManager) Initialize()           {}

func (m *TeamManager) Team(player string) string { return m.teamByPlayer[player] }
func (m *TeamManager) SetTeam(player, team string) {
	m.RemoveFromTeam(player)

	m.teamByPlayer[player] = team

	if _, ok := m.playersByTeam[team]; !ok {
		m.playersByTeam[team] = []string{player}
	} else {
		m.playersByTeam[team] = append(m.playersByTeam[team], player)
	}
}

func (m *TeamManager) Players(team string) []string { return m.playersByTeam[team] }

func (m *TeamManager) RemoveFromTeam(player string) {
	if team, ok := m.teamByPlayer[player]; ok {
		delete(m.teamByPlayer, player)

		if players, ok := m.playersByTeam[team]; ok {
			for i, name := range players {
				if name == player {
					m.playersByTeam[team] = append(players[:i], players[i+1:]...)
					break
				}
			}
		}
	}
}
