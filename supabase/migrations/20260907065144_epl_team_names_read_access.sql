revoke select on public.epl_teams from anon, authenticated;

grant select (id, name) on public.epl_teams to anon, authenticated;

create policy "EPL Team columns are readable by everyone"
  on public.epl_teams
  for select
  to anon, authenticated
  using (true);
