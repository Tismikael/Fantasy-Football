grant select on public.fantasy_team to authenticated;
grant select on public.fantasy_squad to authenticated;

create policy "Users can read their own fantasy team"
  on public.fantasy_team
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can read their own fantasy squad"
  on public.fantasy_squad
  for select
  to authenticated
  using (
    exists (
      select 1 from fantasy_team
      where fantasy_team.id = fantasy_squad.fantasy_team_id
      and fantasy_team.user_id = auth.uid()
    )
  );
