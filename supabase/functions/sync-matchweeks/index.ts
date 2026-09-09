import { createClient } from 'npm:@supabase/supabase-js@2'
import { BOOTSTRAP_STATIC_URL } from '../../../src/constants/url'

type FplEvent = {
  id: number
  deadline_time: string
}

type FplBootstrapStatic = {
  events: FplEvent[]
}

Deno.serve(async () => {
  try {
    const res = await fetch(BOOTSTRAP_STATIC_URL)
    if (!res.ok) {
      throw new Error(`FPL API responded with ${res.status}`)
    }

    const data: FplBootstrapStatic = await res.json()

    const matchweeks = data.events.map((event) => ({
      id: event.id,
      deadline_time: event.deadline_time,
    }))

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error } = await supabase.from('epl_matchweeks').upsert(matchweeks, { onConflict: 'id' })
    if (error) throw error

    return new Response(JSON.stringify({ success: true, count: matchweeks.length }), {
      headers: { 'Content-Type': 'application/json' },
    })
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
