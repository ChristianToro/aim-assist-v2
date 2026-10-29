-- One row per match a signed-in player starts (POST /api/matches). It is
-- the ticket POST /api/scores redeems: the server's own start time, the
-- mode, and a single submit (PLAN-SCORING.md).
create table matches (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null
    references neon_auth."user" (id) on delete cascade,
  mode         text        not null
    check (mode in ('Gridshot', 'Precision', 'Speed', 'Tracking', 'Flick', 'Survival')),
  started_at   timestamptz not null default now(),
  -- An unsubmitted match can't be redeemed after this: its duration plus
  -- 30 minutes, or 2 hours for Survival (matchPolicy.js).
  expires_at   timestamptz not null,
  submitted_at timestamptz,
  check (expires_at > started_at),
  check (submitted_at is null or submitted_at between started_at and expires_at),
  -- The target of scores' composite key below.
  unique (id, user_id, mode)
);

-- The issue limit counts a player's matches started in the last 10 minutes.
create index matches_user_started_idx on matches (user_id, started_at desc);

-- Each new score names the match it was computed from, at most once, and
-- the composite key makes the database refuse a score whose player or mode
-- differs from its match's. Rows saved before matches existed keep a null
-- match_id, which the key doesn't check (PLAN-SCORING.md, "Legacy rows").
alter table scores
  add column match_id uuid unique,
  add constraint scores_match_fkey
    foreign key (match_id, user_id, mode)
    references matches (id, user_id, mode);
