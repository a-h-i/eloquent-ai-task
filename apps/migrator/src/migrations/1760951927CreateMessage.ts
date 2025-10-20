import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
    create type message_author as enum ('user', 'bot');
    create table message
    (
      id              bigserial      not null primary key,
      conversation_id uuid           not null references conversation (id),
      author          message_author not null,
      content         text           not null,
      created_at      timestamptz    not null default now(),
      updated_at      timestamptz    not null default now()
    );
    create trigger set_timestamps_message
      before update
      on message
      for each row execute procedure set_timestamps();


  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('message').execute();
  await db.schema.dropType('message_author').execute();
}
