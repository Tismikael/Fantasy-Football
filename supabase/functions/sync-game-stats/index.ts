import { createClient } from 'npm:@supabase/supabase-js@2'
import { BOOTSTRAP_STATIC_URL } from '../../../src/constants/url'

const liveUrl = (eventId: number) => `https://fantasy.premierleague.com/api/event/${eventId}/live/`

type FplEvent = {
  id: number
  finished: boolean
}

type FplLiveElement = {
  id: number
  stats: {
    goals_scored: number
    assists: number
    yellow_cards: number
    red_cards: number
    saves: number
  }
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: unknown }).message)
  }
  return JSON.stringify(err)
}

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const bootstrapRes = await fetch(BOOTSTRAP_STATIC_URL)
    if (!bootstrapRes.ok) {
      throw new Error(`FPL API responded with ${bootstrapRes.status}`)
    }
    const bootstrap: { events: FplEvent[] } = await bootstrapRes.json()

    const finishedEvents = bootstrap.events.filter((e) => e.finished)
    if (finishedEvents.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No finished matchweek yet.' }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    const targetGameWeek = Math.max(...finishedEvents.map((e) => e.id))

    const { count: existingCount, error: countError } = await supabase
      .from('game_stats')
      .select('id', { count: 'exact', head: true })
      .eq('game_week', targetGameWeek)

    if (countError) throw countError

    if (existingCount && existingCount > 0) {
      return new Response(
        JSON.stringify({ success: true, message: `Matchweek ${targetGameWeek} already synced.` }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    const liveRes = await fetch(liveUrl(targetGameWeek))
    if (!liveRes.ok) {
      throw new Error(`FPL live API responded with ${liveRes.status}`)
    }
    const live: { elements: FplLiveElement[] } = await liveRes.json()

    const rows = live.elements.map((el) => ({
      player_id: el.id,
      game_week: targetGameWeek,
      goals: el.stats.goals_scored,
      assists: el.stats.assists,
      yellow_cards: el.stats.yellow_cards,
      red_cards: el.stats.red_cards,
      saves: el.stats.saves,
    }))

    const { error: upsertError } = await supabase
      .from('game_stats')
      .upsert(rows, { onConflict: 'player_id,game_week' })
    if (upsertError) throw upsertError

    const { error: pointsError } = await supabase.rpc('apply_matchweek_points', {
      p_game_week: targetGameWeek,
    })
    if (pointsError) throw pointsError

    return new Response(
      JSON.stringify({ success: true, game_week: targetGameWeek, players_synced: rows.length }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: errorMessage(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
