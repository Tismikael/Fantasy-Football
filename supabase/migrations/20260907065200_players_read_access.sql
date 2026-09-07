revoke select on public.players from anon, authenticated;

grant select on public.players to anon, authenticated;

create policy "Players are readable by everyone"
  on public.players
  for select
  to anon, authenticated
  using (true);
