import { useState } from 'react'
import { Player, type Position } from '../../../lib/models/player'
import { Team } from '../../../lib/models/team'
import { supabase } from '../../../lib/supabaseClient'
import { 
    STARTING_POSITION_LIMITS, 
    POSITION_GROUPS, 
    TOTAL_STARTERS 

} from '../../../constants/builder'


export function RosterBuilder({
  team,
  initialSelectedIds,
  isEditing,
  onCancel,
  onSave,
}: {
  team: Team
  initialSelectedIds?: number[]
  isEditing?: boolean
  onCancel: () => void
  onSave: (lineup: Team) => void
}) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(initialSelectedIds ?? []))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const positionCount = (position: Position) =>
    team.players.filter((p) => p.position === position && selectedIds.has(p.id)).length

  const handleToggle = (player: Player) => {
    setError(null)

    if (selectedIds.has(player.id)) {
      const next = new Set(selectedIds)
      next.delete(player.id)
      setSelectedIds(next)
      return
    }

    if (selectedIds.size >= TOTAL_STARTERS) {
      setError(`You already have ${TOTAL_STARTERS} players selected.`)
      return
    }

    if (positionCount(player.position) >= STARTING_POSITION_LIMITS[player.position]) {
      const label = POSITION_GROUPS.find((g) => g.position === player.position)?.label.toLowerCase();
      const formattedLabel = label === 'goalkeepers' ? label.slice(0, -1) : label;
      setError(`You can only select up to ${STARTING_POSITION_LIMITS[player.position]} ${formattedLabel}.`)
      return
    }

    setSelectedIds(new Set(selectedIds).add(player.id))
  }

  const handleSave = async () => {
  
    setSaving(true)
    setError(null)

    const { error: rpcError } = await supabase.rpc('set_starting_eleven', {
      player_ids: Array.from(selectedIds),
    })

    setSaving(false)

    if (rpcError) {
      setError(rpcError.message)
      return
    }

    const startingPlayers = team.players.filter((p) => selectedIds.has(p.id))
    onSave(new Team(team.user, startingPlayers))
  }

  return (
    <div className="mt-5 mx-auto max-w-2xl px-5 text-white w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{isEditing ? 'Edit Lineup' : 'Lineup Selection'}</h2>
        <button
          onClick={onCancel}
          className="rounded-md border border-gray-400 px-2.5 py-1.5 text-white hover:bg-[#630873] cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <div className="mt-5 flex justify-between items-center">
        <div className={`rounded-lg ${selectedIds.size === TOTAL_STARTERS ? 'bg-green-500' : 'bg-red-500'} w-20 p-1.5 text-center`}>
          <h2>{selectedIds.size}/{TOTAL_STARTERS}</h2>
        </div>
        <button
            onClick={handleSave}
            disabled={selectedIds.size !== TOTAL_STARTERS || saving}
            className="rounded-lg bg-green-500 px-3.5 py-2.5 font-semibold hover:bg-green-400 disabled:opacity-50 cursor-pointer"
        >
            {saving ? 'Saving...' : 'Save Lineup'}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-5 space-y-5">
        {POSITION_GROUPS.map(({ position, label }) => {
          const playersInGroup = team.players.filter((p) => p.position === position)
          if (playersInGroup.length === 0) return null
          return (
            <div key={position}>
              <h3 className="border-b border-gray-600 pb-1 text-lg font-bold">
                {label} ({positionCount(position)}/{STARTING_POSITION_LIMITS[position]})
              </h3>
              <ul className="mt-2">
                {playersInGroup.map((player) => (
                  <li key={player.id} className="flex items-center gap-3 py-2">
                    <input
                      type="checkbox"
                      className="h-5 w-5"
                      checked={selectedIds.has(player.id)}
                      onChange={() => handleToggle(player)}
                    />
                    <label className="text-sm">
                      {player.name} <span className="text-gray-400">· {player.team}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

    </div>
  )
}
