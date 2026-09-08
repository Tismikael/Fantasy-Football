import { useEffect, useState } from 'react'

interface MatchDay {
    homeTeam: string;
    awayTeam: string;
    matchTime: Date;
}

interface MatchWeek {
    weekNumber: number;
    games: MatchDay[];
}

interface UpcomingMatchWeeks {
    matchWeeks: MatchWeek[];
}

type RawFixture = {
  event: number | null
  kickoff_time: string | null
  team_h: number
  team_a: number
  finished: boolean
}

type RawTeam = {
  id: number
  name: string
}

const FIXTURES_URL = '/fpl-api/fixtures/?future=1'
const BOOTSTRAP_URL = '/fpl-api/bootstrap-static/'
const MATCHWEEKS_PER_PAGE = 2

function formatKickoff(date: Date) {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function UpcomingGames({ onCancel }: { onCancel: () => void }) {
  const [data, setData] = useState<UpcomingMatchWeeks>({ matchWeeks: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadFixtures() {
      try {
        const [fixturesRes, bootstrapRes] = await Promise.all([
          fetch(FIXTURES_URL),
          fetch(BOOTSTRAP_URL),
        ])

        if (!fixturesRes.ok || !bootstrapRes.ok) {
          throw new Error('Failed to fetch fixtures')
        }

        const fixtures: RawFixture[] = await fixturesRes.json()
        const bootstrap: { teams: RawTeam[] } = await bootstrapRes.json()
        const teamNameById = new Map(bootstrap.teams.map((t) => [t.id, t.name]))

        const weekMap = new Map<number, MatchDay[]>()
        for (const fixture of fixtures) {
          if (fixture.finished || fixture.event === null || !fixture.kickoff_time) continue

          const games = weekMap.get(fixture.event) ?? []
          games.push({
            homeTeam: teamNameById.get(fixture.team_h) ?? 'Unknown',
            awayTeam: teamNameById.get(fixture.team_a) ?? 'Unknown',
            matchTime: new Date(fixture.kickoff_time),
          })
          weekMap.set(fixture.event, games)
        }

        const matchWeeks: MatchWeek[] = Array.from(weekMap.entries())
          .sort(([a], [b]) => a - b)
          .map(([weekNumber, games]) => ({
            weekNumber,
            games: games.sort((a, b) => a.matchTime.getTime() - b.matchTime.getTime()),
          }))

        if (!cancelled) setData({ matchWeeks })
      } catch {
        if (!cancelled) setError('Could not load upcoming fixtures. Please try again later.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadFixtures()
    return () => {
      cancelled = true
    }
  }, [])

  const totalPages = Math.ceil(data.matchWeeks.length / MATCHWEEKS_PER_PAGE)
  const visibleWeeks = data.matchWeeks.slice(
    page * MATCHWEEKS_PER_PAGE,
    page * MATCHWEEKS_PER_PAGE + MATCHWEEKS_PER_PAGE
  )


  return (
    <div className="mt-5 mx-auto max-w-2xl px-5 pb-16 text-white w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Upcoming Fixtures</h2>
        <button
          onClick={onCancel}
          className="rounded-md border border-gray-400 px-2.5 py-1.5 text-white hover:bg-[#630873] cursor-pointer"
        >
          Back to Main View
        </button>
      </div>

      {loading && <p className="mt-5 text-gray-300 text-center items-center">Loading fixtures...</p>}
      {error && <p className="mt-5 text-red-400">{error}</p>}

      {!loading && !error && (
        <>
          <div className="mt-5 space-y-6">
            {visibleWeeks.map((week) => (
              <div key={week.weekNumber} className="border-b border-gray-100">
                <h3 className="pb-1 text-lg font-bold text-center">
                  Matchweek {week.weekNumber}
                </h3>
                <ul className="mt-2">
                  {week.games.map((game, i) => (
                    <li key={i} className=" justify-between gap-4 py-2">
                      <div className="flex justify-center gap-10">
                        <span className="text-lg">{game.homeTeam}</span> 
                        <span>vs</span> 
                        <span className="text-lg">{game.awayTeam}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-sm text-gray-400">
                            {formatKickoff(game.matchTime)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={page === 0}
              className="rounded-md border border-gray-400 px-3 py-1.5 hover:bg-[#630873] disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <span className="text-sm text-gray-300">
              Page {page + 1} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
              disabled={page >= totalPages - 1}
              className="rounded-md border border-gray-400 px-3 py-1.5 hover:bg-[#630873] disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}
