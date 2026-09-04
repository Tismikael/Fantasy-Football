import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabaseClient'

export const Route = createFileRoute('/profile/')({
  component: Profile,
})

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasTeam, setHasTeam] = useState(true);

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
          className="rounded-lg border-2 border-gray-400 font-semibold text-xl px-3.5 py-2.5 text-white hover:bg-[#630873] w-lg cursor-pointer"
        >
            View Upcoming Games
        </button>
      </div>

      {/* Create Team Section */}
      {hasTeam && (
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
      <div className="mt-5 flex bg-[url('/soccer-field.jpg')] bg-no-repeat bg-center bg-[length:70%_100%] h-screen w-screen ">

      </div>

    </div>
  )
}
