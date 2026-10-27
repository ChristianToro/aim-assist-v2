-- One row per finished match. Profile stats (games played, best score,
-- average accuracy, favourite mode) are derived from this table in SQL,
-- never stored, so concurrent matches can't lose an update.
--
-- user_id becomes a uuid with a foreign key to Neon Auth's neon_auth."user"
-- table in the auth migration (M3); nothing writes here before then.
create table scores (
  id            bigint generated always as identity primary key,
  user_id       text        not null,
  -- The display labels from src/game/modes.js, as the client sends them.
  mode          text        not null
    check (mode in ('Gridshot', 'Precision', 'Speed', 'Tracking', 'Flick', 'Survival')),
  -- A sanity bound, not anti-cheat: Survival is endless, and this is about
  -- two hours of flawless play at its hardest spawn rate.
  score         integer     not null check (score between 0 and 10000000),
  accuracy      real        not null check (accuracy between 0 and 100),
  -- Null when a match ends with zero hits (ScoreManager.summary).
  reaction_time integer     check (reaction_time between 0 and 60000),
  created_at    timestamptz not null default now()
);

-- All-time board: top scores overall.
create index scores_score_idx on scores (score desc);
-- Personal bests, and one-entry-per-player boards via DISTINCT ON (user_id).
create index scores_user_score_idx on scores (user_id, score desc);
-- Daily and weekly boards filter on a UTC window of created_at.
create index scores_created_at_idx on scores (created_at desc);
