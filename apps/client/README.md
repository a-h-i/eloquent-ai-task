# Frontend

This is the client app.
This app is built using Next.js and is part of the Moon monorepo.





## Schema generation
We use Kysely to introspect the database and generate the schema.
First run the migrations via `docker compose run migrate`.
Then with the db up `docker compose up app-db` run `pnpm run schema:generate`.
Before running the schema generation make sure the following env variable is set in a .env file
`DATABASE_URL=postgres://db_user:password@localhost:5433/eloquent_db`.
The values assume no changes were made to the [docker-compose.yml](docker-compose.yml) file.

The schema only needs to be regenerated when the database schema changes. Changes to the database schema are performed
via migrations using the [migrator](../migrator/src/migrate.ts) app.



## Development
To run the app locally run `moon client:dev`
