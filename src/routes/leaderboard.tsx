import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/leaderboard')({
  component: Leaderboard,
})

type LeaderboardEntry = {
  rank: number
  username: string
  points: number
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'GoalGetter99', points: 2145 },
  { rank: 2, username: 'PepGuardiolaFan', points: 2098 },
  { rank: 3, username: 'MikaelYikum', points: 2033 },
  { rank: 4, username: 'RedDevilRuler', points: 1987 },
  { rank: 5, username: 'ArsenalTillIDie', points: 1954 },
  { rank: 6, username: 'KopiteKing', points: 1921 },
  { rank: 7, username: 'BlueMoonRising', points: 1888 },
  { rank: 8, username: 'SpursNeverWin', points: 1850 },
  { rank: 9, username: 'HaalandStanAccount', points: 1812 },
  { rank: 10, username: 'TransferWindowGuru', points: 1777 },
]

function Leaderboard() {
  const navigate = useNavigate()

  return (
    <div className="px-6 py-10 lg:px-8 bg-[#32043a] min-h-screen">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-white text-xl sm:text-4xl font-bold">Leaderboard</h1>
        <button
          onClick={() => navigate({ to: '/profile' })}
          className="rounded-md border border-gray-400 font-semibold px-2.5 py-1.5 text-white hover:bg-[#630873] cursor-pointer"
        >
          Back to Profile
        </button>
      </div>
      <hr className="mt-5 border-gray-100 border-1.5" />

      <div className="mx-auto mt-10 max-w-2xl overflow-x-auto">
        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-gray-500 text-left text-gray-300 text-sm uppercase">
              <th className="py-2 px-3">Rank</th>
              <th className="py-2 px-3">Username</th>
              <th className="py-2 px-3 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {mockLeaderboard.map((entry) => {
              const isYou = entry.username === 'MikaelYikum'
              return (
                <tr
                  key={entry.rank}
                  className={`border-b border-gray-700 hover:bg-[#42095a] ${isYou ? 'rounded-md outline outline-2 outline-yellow-400 -outline-offset-2' : ''}`}
                >
                  <td className="py-3 px-3 font-bold">{entry.rank}</td>
                  <td className="py-3 px-3">{entry.username}</td>
                  <td className="py-3 px-3 text-right font-semibold">{entry.points.toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
