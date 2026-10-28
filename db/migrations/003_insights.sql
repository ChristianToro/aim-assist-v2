-- One row per AI recommendation generated for a player. It is both the
-- cache (a request whose inputs hash the same as the latest row reuses it)
-- and the rate limit (rows in the last 24 hours count against the daily cap).
-- 'platforms' is M8's kind; the column is shared so both reuse one policy.
create table insights (
  id          bigint generated always as identity primary key,
  user_id     uuid        not null
    references neon_auth."user" (id) on delete cascade,
  kind        text        not null check (kind in ('hardware', 'platforms')),
  -- sha256 hex of the stats, player-supplied setup and prompt version.
  input_hash  text        not null check (input_hash ~ '^[0-9a-f]{64}$'),
  result      jsonb       not null,
  -- The model that answered; a server-side fallback may differ from the
  -- requested one.
  model       text        not null,
  created_at  timestamptz not null default now()
);

-- Latest row per player and kind (cache), and the 24-hour count (limit).
create index insights_user_kind_created_idx
  on insights (user_id, kind, created_at desc);
