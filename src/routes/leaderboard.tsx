import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export const Route = createFileRoute('/leaderboard')({
  component: Leaderboard,
})

type LeaderboardEntry = {
  username: string
  total_points: number
}


function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getTopTenUsers = async () => {
      const { data, error } = await supabase
          .from('users')
          .select("username, total_points")
          .order("total_points", { ascending: false })
          .limit(10)

      setLeaderboardData(data)

    };

    getTopTenUsers();

  },[]);



  return (
    <div className="px-6 py-10 lg:px-8 bg-[#32043a] min-h-screen">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-white text-xl sm:text-4xl font-bold">Top 10 Leaderboard</h1>
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
            {leaderboardData ?
            leaderboardData.map((entry, index) => {
              const isYou = entry.username === 'MikaelYikum'
              return (
                <tr
                  key={index}
                  className={`border-b border-gray-700 hover:bg-[#42095a] ${isYou ? 'rounded-md outline outline-2 outline-yellow-400 -outline-offset-2' : ''}`}
                >
                  <td className="py-3 px-3 font-bold">{index + 1}</td>
                  <td className="py-3 px-3">{entry.username}</td>
                  <td className="py-3 px-3 text-right font-semibold">{entry.total_points.toLocaleString()}</td>
                </tr>
              )
            }) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
