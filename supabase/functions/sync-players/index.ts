import { createClient } from 'npm:@supabase/supabase-js@2'
import { BOOTSTRAP_STATIC_URL } from '../../../src/constants/url'
const POSITION_BY_ELEMENT_TYPE: Record<number, string> = {
  1: 'GK',
  2: 'DF',
  3: 'MF',
  4: 'ST',
}

type FplTeam = {
  id: number
  name: string
}

type FplElement = {
  id: number
  first_name: string
  second_name: string
  team: number
  element_type: number
  now_cost: number
}

type FplBootstrapStatic = {
  teams: FplTeam[]
  elements: FplElement[]
}

Deno.serve(async () => {
  try {
    const res = await fetch(BOOTSTRAP_STATIC_URL)
    if (!res.ok) {
      throw new Error(`FPL API responded with ${res.status}`)
    }

    const data: FplBootstrapStatic = await res.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const teams = data.teams.map((team) => ({ id: team.id, name: team.name }))
    const { error: teamsError } = await supabase.from('epl_teams').upsert(teams, { onConflict: 'id' })
    if (teamsError) throw teamsError

    const players = data.elements.map((element) => ({
      fpl_id: element.id,
      name: `${element.first_name} ${element.second_name}`,
      team_id: element.team,
      position: POSITION_BY_ELEMENT_TYPE[element.element_type] ?? 'Unknown',
      price: element.now_cost / 10,
    }))

    const { error: playersError } = await supabase.from('players').upsert(players, { onConflict: 'fpl_id' })
    if (playersError) throw playersError

    return new Response(
      JSON.stringify({ success: true, teams: teams.length, players: players.length }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : JSON.stringify(err)

    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
