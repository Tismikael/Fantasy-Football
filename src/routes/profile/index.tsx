import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabaseClient'
import { BsPerson } from "react-icons/bs";
import { Player, type Position } from '../../lib/models/player'
import { Team } from '../../lib/models/team';
import { TeamBuilder } from './-components/TeamBuilder'
import { RosterBuilder } from './-components/RosterBuilder';
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

const sampleFormation: number[][] = [
  [1],[1,1,1,1],[1,1,1],[1,1,1]
]

const rowTopPercent = [88, 64, 38, 14]

const formationOrder: Position[] = ['GK', 'DF', 'MF', 'ST']

function groupIntoFormation(players: Player[]): Player[][] {
  return formationOrder.map((position) => players.filter((p) => p.position === position))
}



function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [startingElevenIds, setStartingElevenIds] = useState<number[] | null>(null);
  const [nextDeadline, setNextDeadline] = useState<Date | null>(null);

  const [loading, setLoading] = useState(true);
  const [hasTeam, setHasTeam] = useState(false);

  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isViewingUpcomingGames, setIsViewingUpcomingGames] = useState(false);
  const [isCreatingStartingEleven, setIsCreatingStartingEleven] = useState(false);

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const hasStartingEleven = startingElevenIds !== null;
  const canEditLineup = nextDeadline !== null;
  const startingPlayers = hasStartingEleven && team
    ? team.players.filter((p) => startingElevenIds!.includes(p.id))
    : [];
  const benchPlayers = hasStartingEleven && team
    ? team.players.filter((p) => !startingElevenIds!.includes(p.id))
    : [];

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        navigate({ to: '/login' });
        return;
      }
      setUser(data.user);

      // check deadline to set starting lineup
      const { data: deadlineRow, error: deadlineError } = await supabase
        .from('epl_matchweeks')
        .select('deadline_time')
        .gt('deadline_time', new Date().toISOString())
        .order('deadline_time', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (deadlineError) {
        console.error('Failed to load next matchweek deadline:', deadlineError);
      } else if (deadlineRow) {
        setNextDeadline(new Date(deadlineRow.deadline_time));
      }

      // check if user has a team
      const { data: teamRow, error: teamError } = await supabase
        .from('fantasy_team')
        .select('id, starting_eleven')
        .eq('user_id', data.user.id)
        .limit(1)
        .maybeSingle();

      if (teamError) {
        console.error('Failed to load fantasy team:', teamError);
      }

      // load fantasy squad
      if (teamRow) {
        const { data: squadRows, error: squadError } = await supabase
          .from('fantasy_squad')
          .select('players(id, name, position, price, epl_teams(name))')
          .eq('fantasy_team_id', teamRow.id);

        if (squadError) {
          console.error('Failed to load fantasy squad:', squadError);
        } else if (squadRows) {

          const players = squadRows
            .map((row) => row.players)
            .filter(Boolean)
            .map(
              (p: any) =>
                new Player(p.name, p.position, p.epl_teams?.name ?? 'N/A', p.id, p.price)
            );

          setTeam(new Team(data.user.id, players));
          setHasTeam(true);
          setStartingElevenIds(teamRow.starting_eleven);
        }
      }

      setLoading(false);
    });
  }, [navigate]);


  const handleCreateTeam = () => {
    setIsCreatingTeam(true);
  };

  const handleCreateStartingEleven = () => {
    setIsCreatingStartingEleven(true);
  };

  const handleViewUpcomingGames = () => {
    setIsViewingUpcomingGames(true);
  };

  const handleSaveTeam = (players: Player[]) => {
    setTeam(new Team(user!.id, players));
    setHasTeam(true);
    setIsCreatingTeam(false);
  };

  const handleSaveStartingEleven = (lineup: Team) => {
    setStartingElevenIds(lineup.players.map((p) => p.id));
    setIsCreatingStartingEleven(false);
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
  const pitchFormation = hasTeam
    ? groupIntoFormation(hasStartingEleven ? startingPlayers : team!.players)
    : null;

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
      {!isCreatingStartingEleven && (
        <div className="flex justify-center mt-10">
          <button
            onClick={handleViewUpcomingGames}
            className="rounded-lg border-2 border-gray-400 font-semibold text-xl px-3.5 py-2.5 text-white hover:bg-[#630873] w-md sm:w-lg cursor-pointer"
          >
              View Upcoming Fixtures
          </button>
        </div>
      )}

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

      {/* Starting Eleven Section */}
      {hasTeam && canEditLineup && !isCreatingStartingEleven && !isViewingUpcomingGames &&(
        <div className="flex flex-col justifty-center mx-auto mt-5">
          <button
            onClick={handleCreateStartingEleven}
            className="rounded-lg border-2 border-gray-400 font-normal text-xl px-2.5 py-1.5 text-white hover:bg-[#630873] cursor-pointer"
          >
            {hasStartingEleven ? 'Edit Starting Eleven' : 'Create Starting Eleven'}
          </button>
        </div>
      )}

      {isCreatingTeam ? (
        <TeamBuilder onCancel={() => setIsCreatingTeam(false)} onSave={handleSaveTeam} />
      ) :

      isCreatingStartingEleven && team ? (
        <RosterBuilder
          team={team}
          initialSelectedIds={startingElevenIds ?? undefined}
          isEditing={hasStartingEleven}
          onCancel={() => setIsCreatingStartingEleven(false)}
          onSave={handleSaveStartingEleven}
        />
      ) :

      isViewingUpcomingGames ? (
        <UpcomingGames onCancel={() => setIsViewingUpcomingGames(false)} />
      ) :

      (
        <div className="mt-5 relative flex justify-center items-center bg-[url('/soccer-field.jpg')] bg-no-repeat bg-center bg-[length:70%_100%] h-screen w-screen ">
        {/* Soccer Field Section  */}
            {pitchFormation ? (
              pitchFormation.map((row, rowIndex) =>
                row.map((player, i) => {
                  const left = 15 + ((i + 1) / (row.length + 1)) * 70
                  return (
                    <div
                      key={player.id}
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
                  const top = rowTopPercent[rowIndex]
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
      {hasStartingEleven && !isCreatingTeam && !isViewingUpcomingGames && !isCreatingStartingEleven && (
        <div className="flex justify-center gap-4 mt-5">
          {benchPlayers.map((player) => (
            <PlayerCard key={player.id} player={player} onClick={() => setSelectedPlayer(player)} />
          ))}
        </div>
      )}

      {selectedPlayer && (
        <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}

    </div>
  )
}
