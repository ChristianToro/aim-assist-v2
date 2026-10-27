-- Neon Auth's user ids are uuids (neon_auth."user".id), so user_id moves
-- from text to uuid before it can reference them. scores is still empty
-- here, so the cast never meets existing data.
alter table scores
  alter column user_id type uuid using user_id::uuid;

-- Deleting a user in Neon Auth deletes their scores with them.
alter table scores
  add constraint scores_user_id_fkey
  foreign key (user_id) references neon_auth."user" (id) on delete cascade;
