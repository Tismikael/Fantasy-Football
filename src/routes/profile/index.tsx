import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabaseClient'
import { BsPerson } from "react-icons/bs";
import { Player, type Position } from '../../lib/models/player'
import { Team } from '../../lib/models/team';
import { TeamBuilder } from './-components/TeamBuilder'
import { UpcomingGames } from './-components/UpcomingGames';

export const Route = createFileRoute('/profile/')({
  component: Profile,
})



function PlayerCard({ player, onClick }: { player: Player; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 bg-blue-200 w-13 h-15 rounded-lg sm:w-20 sm:h-20 sm:rounded-3xl cursor-pointer hover:bg-blue-300"
    >
      <span className="text-black text-xs sm:text-md font-semibold truncate w-full text-center px-1">{player.name}</span>
      <span className="text-black text-xs sm:text-md font-semibold truncate w-full text-center px-1">{player.jerseyNumber}</span>
    </div>
  )
}

function PlayerModal({ player, onClose }: { player: Player; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative min-w-[250px] rounded-xl bg-white p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-2 text-xl text-gray-500 hover:text-black cursor-pointer"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold text-black">{player.name}</h2>
        <p className="mt-2 text-gray-700 font-bold text-xl sm:text-3xl">{player.jerseyNumber}</p>
        <p className="mt-1 text-gray-700 font-bold text-xl sm:text-1xl">{player.team}</p>
      </div>
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

const formation: Player[][] = [
  [new Player('Alisson', 'GK', 'Liverpool', 1, 5.5)],
  [
    new Player('Trent', 'DF', 'Real Madrid', 2, 7.0),
    new Player('Van Dijk', 'DF', 'Liverpool', 4, 6.5),
    new Player('Gabriel', 'DF', 'Arsenal', 6, 5.5),
    new Player('Robertson', 'DF', 'Liverpool', 26, 6.0),
  ],
  [
    new Player('Rice', 'MF', 'Arsenal', 41, 5.5),
    new Player('Bruno Fernandes', 'MF', 'Manchester United', 8, 9.0),
    new Player('Palmer', 'MF', 'Chelsea', 20, 10.5),
  ],
  [
    new Player('Salah', 'ST', 'Liverpool', 11, 13.0),
    new Player('Haaland', 'ST', 'Manchester City', 9, 14.5),
    new Player('Isak', 'ST', 'Liverpool', 14, 8.5),
  ],
]

const sampleFormation: number[][] = [
  [1],[1,1,1,1],[1,1,1],[1,1,1]
]

const reserves: Player[] = [
  new Player('Raya', 'GK', 'Arsenal', 22, 5.0),
  new Player('Saliba', 'DF', 'Arsenal', 12, 5.5),
  new Player('Foden', 'MF', 'Manchester City', 47, 7.5),
  new Player('Watkins', 'ST', 'Aston Villa', 9, 8.0),
]

const rowTopPercent = [88, 64, 38, 14]
const minRTP = [50, 40, 20, 10]

const formationOrder: Position[] = ['GK', 'DF', 'MF', 'ST']

function groupIntoFormation(players: Player[]): Player[][] {
  return formationOrder.map((position) => players.filter((p) => p.position === position))
}

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
  const [hasTeam, setHasTeam] = useState(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isViewingUpcomingGames, setIsViewingUpcomingGames] = useState(false);
  const [customFormation, setCustomFormation] = useState<Player[][] | null>(null);
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


  const handleCreateTeam = () => {
    setIsCreatingTeam(true);
  };

  const handleViewUpcomingGames = () => {
    setIsViewingUpcomingGames(true);
  };

  const handleSaveTeam = (players: Player[]) => {
    setCustomFormation(groupIntoFormation(players));
    setHasTeam(true);
    setIsCreatingTeam(false);
  };

  const handleLeaderboard = () => {
    navigate({ to: '/leaderboard'});
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
          onClick={handleViewUpcomingGames}
          className="rounded-lg border-2 border-gray-400 font-semibold text-xl px-3.5 py-2.5 text-white hover:bg-[#630873] w-md sm:w-lg cursor-pointer"
        >
            View Upcoming Games
        </button>
      </div>

      {/* Create Team Section */}
      {!hasTeam && !isCreatingTeam && !isViewingUpcomingGames &&(
        <div className="flex justify-start mt-5 px-5">
          <button 
            onClick={handleCreateTeam}
            className="rounded-lg border-2 border-gray-400 font-normal text-xl px-2.5 py-1.5 text-white hover:bg-[#630873] cursor-pointer"
          >
              Create Team
          </button>
        </div>
      )}

      {isCreatingTeam ? (
        <TeamBuilder onCancel={() => setIsCreatingTeam(false)} onSave={handleSaveTeam} />
      ) : 
      
      isViewingUpcomingGames ? (
        <UpcomingGames onCancel={() => setIsViewingUpcomingGames(false)} />
      ) :
      
      (
        <div className="mt-5 relative flex justify-center items-center bg-[url('/soccer-field.jpg')] bg-no-repeat bg-center bg-[length:70%_100%] h-screen w-screen ">
        {/* Soccer Field Section  */}
            {hasTeam ? (
              (customFormation ?? formation).map((row, rowIndex) =>
                row.map((player, i) => {
                  const left = 15 + ((i + 1) / (row.length + 1)) * 70
                  return (
                    <div
                      key={player.jerseyNumber}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ top: `${rowTopPercent[rowIndex]}%`, left: `${left}%` }}
                    >
                      <PlayerCard player={player} onClick={() => setSelectedPlayer(player)} />
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
      )}

      {/* Reserves Section */}
      {!isCreatingTeam && !isViewingUpcomingGames && (
        <div className="flex justify-center gap-4 mt-5">
          {hasTeam
            ? reserves.map((player) => (
                <PlayerCard key={player.jerseyNumber} player={player} onClick={() => setSelectedPlayer(player)} />
              ))
            : reserves.map((_, i) => <EmptyPlayerCard key={i} />)}
        </div>
      )}

      {selectedPlayer && (
        <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}

    </div>
  )
}
