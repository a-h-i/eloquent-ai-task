
# Eloquent AI task
Simple FAQ bot


## Repository structure
This is a monorepo. It has two main applications
- `apps/client`: Next.js application for the frontend
- `apps/server`: fastapi application for the AI backend

It also has
- `apps/migrator`: a script for migrating the database
- `apps/deploy`: pulumi IaC for deploying the application



## Getting started
We use the following tools:
- Proto for managing tool dependencies such as python and nodejs
- Poetry for managing python dependencies
- pnpm for managing javascript dependencies
- moon for managing the monorepo

First, you must install Proto [follow these instructions](https://moonrepo.dev/docs/proto/install).
After that run `proto use` it will install all the dependencies from the [.prototools](.prototools) file.
After that you can run `moon client:dev` which will run the full stack and the frontend application will be available at http://localhost:3000.

The application runs using docker containers, make sure you have docker installed and properly setup. 


### Environment variables
Before you can run `moon client:dev` Two env files need to be created under `apps/client`
- .env
- .env.backend

The first one is for the frontend and the second one is for the backend.
The first one needs to contain the following
```
# Having database URL defined here allows us to run schema generation without a docker container.
DATABASE_URL=postgres://db_user:password@localhost:5433/eloquent_db
JWT_SECRET=
```
The DB url does not need to be customized as it is based on the default docker-compose.yml file.
The JWT_SECRET is used for signing the JWT tokens. You can generate a random string using openssl for example. `openssl rand -hex 32`

The second file needs to contain these values
```
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=
LANGSMITH_API_KEY=
LANGSMITH_PROJECT=
PINECONE_ENDPOINT=
PINECONE_API_KEY=
PINECONE_INDEX=
```