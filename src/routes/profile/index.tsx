import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabaseClient'
import { BsPerson } from "react-icons/bs";
import { Player } from '../../lib/models/player'
import { Team } from '../../lib/models/team';


export const Route = createFileRoute('/profile/')({
  component: Profile,
})



function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 bg-blue-200 w-13 h-15 rounded-lg sm:w-20 sm:h-20 sm:rounded-3xl">
      <span className="text-black text-xs sm:text-md font-semibold truncate w-full text-center px-1">{player.name}</span>
      <span className="text-black text-xs sm:text-md font-semibold truncate w-full text-center px-1">{player.jerseyNumber}</span>
    </div>
  )
}

function EmptyPlayerCard(){
  return (
    <div className="flex flex-col items-center justify-center gap-1 bg-blue-200 w-13 h-15 rounded-lg sm:w-20 sm:h-20 sm:rounded-3xl">
      <BsPerson className="text-black size-8 sm:size-10" />
    </div>
  )
}

// 1-4-3-3 formation, back row (GK) to front row (ST)
const formation: Player[][] = [
  [new Player('Alisson', 'GK', 'My Team', 1, 5.5)],
  [
    new Player('Trent', 'DF', 'My Team', 2, 7.0),
    new Player('Van Dijk', 'DF', 'My Team', 4, 6.5),
    new Player('Gabriel', 'DF', 'My Team', 6, 5.5),
    new Player('Robertson', 'DF', 'My Team', 26, 6.0),
  ],
  [
    new Player('Rice', 'MF', 'My Team', 41, 5.5),
    new Player('Bruno Fernandes', 'MF', 'My Team', 8, 9.0),
    new Player('Palmer', 'MF', 'My Team', 20, 10.5),
  ],
  [
    new Player('Salah', 'ST', 'My Team', 11, 13.0),
    new Player('Haaland', 'ST', 'My Team', 9, 14.5),
    new Player('Isak', 'ST', 'My Team', 14, 8.5),
  ],
]

const sampleFormation: number[][] = [
  [1],[1,1,1,1],[1,1,1],[1,1,1]
]

const reserves: Player[] = [
  new Player('Raya', 'GK', 'My Team', 22, 5.0),
  new Player('Saliba', 'DF', 'My Team', 12, 5.5),
  new Player('Foden', 'MF', 'My Team', 47, 7.5),
  new Player('Watkins', 'ST', 'My Team', 9, 8.0),
]

const rowTopPercent = [88, 64, 38, 14]
const minRTP = [50, 40, 20, 10]

function useIsSmUp() {
  const [isSmUp, setIsSmUp] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 640px)')
    setIsSmUp(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsSmUp(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])
  return isSmUp
}



function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasTeam, setHasTeam] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const isSmUp = useIsSmUp();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate({ to: '/login' });
        return;
      }
      setUser(data.user);
      setLoading(false);
    });
  }, [navigate]);

  const handleUpcomingGames = () => {

  };

  const handleCreateTeam = () => {

  };

  const handleLeaderboard = () => {
    navigate({ to: '/about'});
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/login' });
  };

  if (loading) {
    return <div className="px-6 py-24 sm:py-20 lg:px-8 bg-[#32043a] min-h-screen text-white">Loading...</div>
  }

  const username = user?.user_metadata?.username ?? user?.email;

  return (
    <div className="py-10 bg-[#32043a] min-h-screen flex flex-col">

      {/* app bar */}
      <div className="flex flex-row justify-between text-center items-center px-6 lg:px-8">
        <h1 className="text-white text-xl sm:text-4xl font-bold">Welcome, {username}</h1>
        <div className="flex gap-4">
            <button
              onClick={handleLeaderboard}
              className="rounded-md border border-gray-400 font-semibold px-2.5 py-1.5 text-white hover:bg-[#630873] cursor-pointer"       
            >
              Leaderboard
            </button>

            <button
              onClick={handleLogout}
              className="rounded-md border border-gray-400 font-semibold px-2.5 py-1.5 text-white hover:bg-[#630873] cursor-pointer"
            >
              Log Out
            </button>
        </div>
      </div>
      <hr className="mt-5 border-gray-100 border-1.5"/>

      {/* Upcoming Games Section */}
      <div className="flex justify-center mt-10">
        <button 
          onClick={handleUpcomingGames}
          className="rounded-lg border-2 border-gray-400 font-semibold text-xl px-3.5 py-2.5 text-white hover:bg-[#630873] w-md sm:w-lg cursor-pointer"
        >
            View Upcoming Games
        </button>
      </div>

      {/* Create Team Section */}
      {!hasTeam && (
        <div className="flex justify-start mt-5 px-5">
          <button 
            onClick={handleCreateTeam}
            className="rounded-lg border-2 border-gray-400 font-normal text-xl px-2.5 py-1.5 text-white hover:bg-[#630873] cursor-pointer"
          >
              Create Team
          </button>
        </div>
      )}

      {/* Soccer Field Section  */}
      <div className="mt-5 relative flex justify-center items-center bg-[url('/soccer-field.jpg')] bg-no-repeat bg-center bg-[length:70%_100%] h-screen w-screen ">
          {hasTeam ? (
            formation.map((row, rowIndex) =>
              row.map((player, i) => {
                const left = 15 + ((i + 1) / (row.length + 1)) * 70
                return (
                  <div
                    key={player.jerseyNumber}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ top: `${rowTopPercent[rowIndex]}%`, left: `${left}%` }}
                  >
                    <PlayerCard player={player} />
                  </div>
                )
              })
            )
          ) : (
            sampleFormation.map((row, rowIndex) =>
              row.map((_, i) => {
                const left = 15 + ((i + 1) / (row.length + 1)) * 70
                const top = isSmUp ? rowTopPercent[rowIndex] : minRTP[rowIndex]
                return (
                  <div
                    key={`${rowIndex}-${i}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ top: `${top}%`, left: `${left}%` }}
                  >
                    <EmptyPlayerCard />
                  </div>
                )
              })
            )
          )}
      </div>

      {/* Reserves Section */}
      <div className="flex justify-center gap-4 mt-5">
        {hasTeam
          ? reserves.map((player) => <PlayerCard key={player.jerseyNumber} player={player} />)
          : reserves.map((_, i) => <EmptyPlayerCard key={i} />)}
      </div>

    </div>
  )
}
