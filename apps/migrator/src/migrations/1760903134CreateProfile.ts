import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  const query = sql`
create table profile (
  username text primary key,
  name text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_regex check (username ~ '^[a-zA-Z0-9_]{3,}$')
);
create trigger set_timestamps_profile before update on profile for each row execute procedure set_timestamps();
`;

  await query.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('profile').execute();
}
