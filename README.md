
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