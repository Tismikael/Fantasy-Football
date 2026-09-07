revoke select on public.users from anon, authenticated;

grant select (username, total_points) on public.users to anon, authenticated;

create policy "Leaderboard columns are readable by everyone"
  on public.users
  for select
  to anon, authenticated
  using (true);
