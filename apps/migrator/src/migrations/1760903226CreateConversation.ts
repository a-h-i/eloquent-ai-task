import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`create table conversation
            (
              id             uuid        not null default gen_random_uuid() primary key,
              title          text,
              owner_username text        not null references profile (username),
              created_at     timestamptz not null default now(),
              updated_at     timestamptz not null default now()
            );
  create trigger set_timestamps_conversation
    before update
    on conversation
    for each row execute procedure set_timestamps();

  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('conversation').execute();
}
