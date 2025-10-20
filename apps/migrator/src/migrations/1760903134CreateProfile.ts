import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  const query = sql`
create table profile (
  username text not null unique,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_timestamps_profile before update on profile for each row execute procedure set_timestamps();
`;

  await query.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('profile').execute();
}
