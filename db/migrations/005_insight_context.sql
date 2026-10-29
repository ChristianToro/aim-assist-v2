-- What a recommendation was generated from besides the player's stats:
-- the request's own input ({ setup } for hardware, {} for platforms), so a
-- past answer can say what it was for. Rows saved before this migration
-- kept only its hash, so theirs stays null (PLAN-INSIGHTS.md).
alter table insights
  add column context jsonb
    check (context is null or jsonb_typeof(context) = 'object');
