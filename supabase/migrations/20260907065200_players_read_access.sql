-- players has no sensitive columns (unlike users' email), so all columns are
-- readable by everyone. No UPDATE policy for anon/authenticated: price syncs
-- happen only via the sync-players Edge Function's service-role key, which
-- bypasses RLS/grants entirely, so client-facing write access is never needed
-- and would otherwise let any user rewrite player data directly via the API.
revoke select on public.players from anon, authenticated;

grant select on public.players to anon, authenticated;

create policy "Players are readable by everyone"
  on public.players
  for select
  to anon, authenticated
  using (true);
