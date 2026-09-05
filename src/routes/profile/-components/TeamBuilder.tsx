import { useState } from 'react'
import { Player, type Position } from '../../../lib/models/player'
import { GoMultiSelect } from "react-icons/go";

const POSITION_LIMITS: Record<Position, number> = {
  GK: 1,
  DF: 4,
  MF: 3,
  ST: 3,
}

const MAX_PER_TEAM = 3

const PREMIER_LEAGUE_TEAMS = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 'Burnley',
  'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Leeds United', 'Liverpool',
  'Manchester City', 'Manchester United', 'Newcastle United', 'Nottingham Forest',
  'Sunderland', 'Tottenham Hotspur', 'West Ham United', 'Wolverhampton Wanderers',
]

const POSITION_GROUPS: { position: Position; label: string }[] = [
  { position: 'GK', label: 'Goalkeepers' },
  { position: 'DF', label: 'Defenders' },
  { position: 'MF', label: 'Midfielders' },
  { position: 'ST', label: 'Forwards' },
]

const PLAYER_POOL: Player[] = [
  new Player('Pickford', 'GK', 'Everton', 1, 5.5),
  new Player('Alisson', 'GK', 'Liverpool', 2, 5.5),
  new Player('Raya', 'GK', 'Arsenal', 3, 5.0),
  new Player('Sels', 'GK', 'Nottingham Forest', 4, 5.0),

  new Player('Van Dijk', 'DF', 'Liverpool', 5, 6.5),
  new Player('Gabriel', 'DF', 'Arsenal', 6, 5.5),
  new Player('Saliba', 'DF', 'Arsenal', 7, 5.5),
  new Player('Gvardiol', 'DF', 'Manchester City', 8, 6.0),
  new Player('Milenkovic', 'DF', 'Nottingham Forest', 9, 5.5),

  new Player('Salah', 'MF', 'Liverpool', 10, 13.0),
  new Player('Palmer', 'MF', 'Chelsea', 11, 10.5),
  new Player('Bruno Fernandes', 'MF', 'Manchester United', 12, 9.0),
  new Player('Mbeumo', 'MF', 'Manchester United', 13, 8.0),
  new Player('Rice', 'MF', 'Arsenal', 14, 5.5),

  new Player('Haaland', 'ST', 'Manchester City', 15, 14.5),
  new Player('Isak', 'ST', 'Liverpool', 16, 8.5),
  new Player('Watkins', 'ST', 'Aston Villa', 17, 8.0),
  new Player('Wood', 'ST', 'Nottingham Forest', 18, 7.0),
]

const MAX_PLAYERS =11;

function isSamePlayer(a: Player, b: Player) {
  return a.team === b.team && a.jerseyNumber === b.jerseyNumber
}

export function TeamBuilder({
  onCancel,
  onSave,
}: {
  onCancel: () => void
  onSave: (players: Player[]) => void
}) {
  const [players, setPlayers] = useState<Player[]>([])
  const [error, setError] = useState<string | null>(null)

  const [showTeamFilter, setShowTeamFilter] = useState(false)
  const [pendingTeams, setPendingTeams] = useState<string[]>([])
  const [activeTeams, setActiveTeams] = useState<string[]>([])
  const [budget, setBudget] = useState(100);

  const positionCount = (position: Position) =>
    players.filter((p) => p.position === position).length

  const teamCount = (team: string) =>
    players.filter((p) => p.team === team).length

  const isSelected = (player: Player) => players.some((p) => isSamePlayer(p, player))

  const togglePendingTeam = (team: string) => {
    setPendingTeams((prev) =>
      prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]
    )
  }

  const handleFilterTeams = () => {
    setActiveTeams(pendingTeams)
    setShowTeamFilter(false)
  }

  const handleResetFilter = () => {
    setPendingTeams([])
    setActiveTeams([])
  }

  const handleTogglePoolPlayer = (player: Player) => {
    setError(null)

    if (isSelected(player)) {
      setPlayers(players.filter((p) => !isSamePlayer(p, player)))
      setBudget((b) => b + player.price)
      return
    }

    if (players.length >= 11) {
      setError('Your squad already has 11 players.')
      return
    }
    if (positionCount(player.position) >= POSITION_LIMITS[player.position]) {
      setError(`You already have the max number of ${player.position}s (${POSITION_LIMITS[player.position]}).`)
      return
    }
    if (teamCount(player.team) >= MAX_PER_TEAM) {
      setError(`You can only select a maximum of ${MAX_PER_TEAM} players from a single team.`)
      return
    }
    if (player.price > budget) {
      setError(`Not enough budget to add ${player.name} (£${player.price.toFixed(1)}m).`)
      return
    }

    setPlayers([...players, player])
    setBudget((b) => b - player.price)
  }

  const handleSave = () => {
    if (players.length !== 11) {
      setError('You need exactly 11 players to save your team.')
      return
    }
    onSave(players)
  }

  const isPendingMax = players.length === MAX_PLAYERS;
  
  const filteredPool = activeTeams.length
    ? PLAYER_POOL.filter((p) => activeTeams.includes(p.team))
    : PLAYER_POOL

  return (
    <div className="mt-5 mx-auto max-w-2xl px-5 pb-16 text-white w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Squad Selection</h2>
        <button
          onClick={onCancel}
          className="rounded-md border border-gray-400 px-2.5 py-1.5 text-white hover:bg-[#630873] cursor-pointer"
        >
          Cancel
        </button>
      </div>
      <div className="flex justify-between items-center mt-5">
        <div className={`rounded-lg ${isPendingMax ? 'bg-green-500' : 'bg-red-500'}  w-15 text-center p-1.5`}>
          <h2> {players.length}/{MAX_PLAYERS}</h2>
        </div>
        <div className="rounded-lg bg-green-500 w-15 text-center p-1.5">
          <h2>£{budget.toFixed(1)}</h2>
        </div>
      </div>
      <p className="mt-1 text-sm text-gray-300">
        Select a maximum of {MAX_PER_TEAM} players from a single team.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => setShowTeamFilter((v) => !v)}
          aria-label="Filter by team"
          className="rounded-md border border-gray-400 p-2 text-white hover:bg-[#630873] cursor-pointer"
        >
          <GoMultiSelect className="size-5" />
        </button>
        {activeTeams.length > 0 && (
          <span className="text-sm text-gray-300">Filtered: {activeTeams.join(', ')}</span>
        )}
      </div>

      {showTeamFilter && (
        <div className="mt-3 rounded-md border border-gray-600 bg-[#42095a] p-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PREMIER_LEAGUE_TEAMS.map((team) => (
              <label key={team} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={pendingTeams.includes(team)}
                  onChange={() => togglePendingTeam(team)}
                />
                {team}
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleFilterTeams}
              className="rounded-md bg-green-500 px-3 py-1.5 font-semibold hover:bg-green-400 cursor-pointer"
            >
              Filter Teams
            </button>
            <button
              onClick={handleResetFilter}
              className="rounded-md border border-gray-400 px-3 py-1.5 hover:bg-[#630873] cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-5 space-y-6">
        {POSITION_GROUPS.map(({ position, label }) => {
          const playersInGroup = filteredPool.filter((p) => p.position === position)
          if (playersInGroup.length === 0) return null
          return (
            <div key={position}>
              <h3 className="border-b border-gray-600 pb-1 text-lg font-bold">{label}</h3>
              <ul className="mt-2 divide-y divide-gray-700">
                {playersInGroup.map((player) => {
                  const selected = isSelected(player)
                  return (
                    <li key={`${player.team}-${player.jerseyNumber}`} className="flex items-center justify-between py-2">
                      <span>
                        {player.name}{' '}
                        <span className="text-sm text-gray-400">· {player.team} · £{player.price.toFixed(1)}m</span>
                      </span>
                      <button
                        onClick={() => handleTogglePoolPlayer(player)}
                        aria-label={selected ? `Remove ${player.name}` : `Add ${player.name}`}
                        className={`flex size-7 items-center justify-center rounded-full font-bold cursor-pointer ${
                          selected ? 'bg-red-500 hover:bg-red-400' : 'bg-green-500 hover:bg-green-400'
                        }`}
                      >
                        {selected ? '×' : '+'}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={players.length !== 11}
        className="mt-6 w-full rounded-md bg-green-500 px-3.5 py-2.5 font-semibold hover:bg-green-400 disabled:opacity-50 cursor-pointer"
      >
        Save Team
      </button>
    </div>
  )
}
