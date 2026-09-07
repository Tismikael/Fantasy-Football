import { useEffect, useState } from 'react'
import { Player, type Position } from '../../../lib/models/player'
import { GoMultiSelect } from "react-icons/go";
import { supabase } from '../../../lib/supabaseClient';

interface PlayerData {
  id: number;
  name: string;
  position: Position;
  price: number;
  team_id: number;
}

const POSITION_LIMITS: Record<Position, number> = {
  GK: 2,
  DF: 5,
  MF: 4,
  ST: 4,
}

const MAX_PER_TEAM = 3
const MAX_PLAYERS = 15
const MIN_NUM_TEAMS = 5;

const POSITION_GROUPS: { position: Position; label: string }[] = [
  { position: 'GK', label: 'Goalkeepers' },
  { position: 'DF', label: 'Defenders' },
  { position: 'MF', label: 'Midfielders' },
  { position: 'ST', label: 'Forwards' },
]

function isSamePlayer(a: PlayerData, b: PlayerData) {
  return a.id === b.id
}

export function TeamBuilder({
  onCancel,
  onSave,
}: {
  onCancel: () => void
  onSave: (players: Player[]) => void
}) {
  const [error, setError] = useState<string | null>(null)

  const [teams, setTeams] = useState<Map<number, string>>(new Map())
  const [playerPool, setPlayerPool] = useState<PlayerData[]>([])
  const [squad, setSquad] = useState<PlayerData[]>([])

  const [showTeamFilter, setShowTeamFilter] = useState(false)
  const [pendingTeams, setPendingTeams] = useState<string[]>([])
  const [activeTeams, setActiveTeams] = useState<string[]>([])
  const [budget, setBudget] = useState(100)

  useEffect(() => {
    const getTeamData = async () => {
      const { data, error } = await supabase.from('epl_teams').select('*')
      if (error || !data) return
      setTeams(new Map(data.map((team) => [team.id, team.name])))
    }

    const getPlayersData = async () => {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, position, price, team_id')

      if (!error && data) setPlayerPool(data)
    }

    getTeamData()
    getPlayersData()
  }, [])

  const positionCount = (position: Position) =>
    squad.filter((p) => p.position === position).length

  const teamCount = (teamName: string) =>
    squad.filter((p) => teams.get(p.team_id) === teamName).length

  const isSelected = (player: PlayerData) => squad.some((p) => isSamePlayer(p, player))

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
    if (squad.length > 0){
      setError('Unselect Players to reset teams selection');
      return;
    }
    setPendingTeams([])
    setActiveTeams([])
  }

  const handleTogglePoolPlayer = (player: PlayerData) => {
    setError(null)

    if (isSelected(player)) {
      setSquad(squad.filter((p) => !isSamePlayer(p, player)))
      setBudget((b) => b + player.price)
      return
    }

    if (squad.length >= MAX_PLAYERS) {
      setError(`Your squad already has ${MAX_PLAYERS} players.`)
      return
    }
    if (positionCount(player.position) >= POSITION_LIMITS[player.position]) {
      setError(`You already have the max number of ${player.position}s (${POSITION_LIMITS[player.position]}).`)
      return
    }
    const teamName = teams.get(player.team_id) ?? ''
    if (teamCount(teamName) >= MAX_PER_TEAM) {
      setError(`You can only select a maximum of ${MAX_PER_TEAM} players from a single team.`)
      return
    }
    if (player.price > budget) {
      setError(`Not enough budget to add ${player.name} (£${player.price.toFixed(1)}m).`)
      return
    }

    setSquad([...squad, player])
    setBudget((b) => b - player.price)
  }

  const handleSave = async () => {
    if (squad.length !== MAX_PLAYERS) {
      setError(`You need exactly ${MAX_PLAYERS} players to save your team.`)
      return
    }
    const players = squad.map(
      (p) => new Player(p.name, p.position, teams.get(p.team_id) ?? 'Unknown', p.id, p.price)
    )

    const playerIds = squad.map((s) => s.id);

    // create new fantasy Team
    const { error } = await supabase.rpc('create_new_team', { player_ids: playerIds});
    if (!error){
      console.log('db updated successfully!');
      onSave(players);
    }

  }

  const isSquadFull = squad.length === MAX_PLAYERS

  const filteredPool = activeTeams.length
    ? playerPool.filter((p) => activeTeams.includes(teams.get(p.team_id) ?? ''))
    : [];

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
        <div className={`rounded-lg ${isSquadFull ? 'bg-green-500' : 'bg-red-500'}  w-15 text-center p-1.5`}>
          <h2> {squad.length}/{MAX_PLAYERS}</h2>
        </div>
        <div className="rounded-lg bg-green-500 w-15 text-center p-1.5">
          <h2>£{budget.toFixed(1)}</h2>
        </div>
      </div>

      <p className="mt-3 font-semibold text-gray-300">Rules</p>
      <ol className="list-decimal list-inside space-y-1">
        <li className="text-sm text-gray-300">
          Select a minimum of {MIN_NUM_TEAMS} teams.
        </li>
        <li className="text-sm text-gray-300">
          You can only select at most {MAX_PER_TEAM} players from a single team.
        </li>
      </ol>

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
            {Array.from(teams).map(([id, name]) => (
              <label key={id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={pendingTeams.includes(name)}
                  onChange={() => togglePendingTeam(name)}
                />
                {name}
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              disabled={pendingTeams.length < MIN_NUM_TEAMS}
              onClick={handleFilterTeams}
              className="rounded-md bg-green-500 px-3 py-1.5 font-semibold hover:bg-green-400 cursor-pointer
                          disabled:bg-green-900 hover:bg-green-900"
            >
              Filter Teams
            </button>
            <button
              onClick={handleResetFilter}
              className="rounded-md border border-gray-400 px-3 py-1.5 hover:bg-[#630873] cursor-pointer"
            >
              Reset Teams
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
                    <li key={player.id} className="flex items-center justify-between py-2">
                      <span>
                        {player.name}{' '}
                        <span className="text-sm text-gray-400">
                          · {teams.get(player.team_id) ?? 'Unknown'} · £{player.price.toFixed(1)}m
                        </span>
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
        disabled={squad.length !== MAX_PLAYERS}
        className="mt-6 w-full rounded-md bg-green-500 px-3.5 py-2.5 font-semibold hover:bg-green-400 disabled:opacity-50 cursor-pointer"
      >
        Save Team
      </button>
    </div>
  )
}
