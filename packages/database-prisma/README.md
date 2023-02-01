# Prisma Database Access Layer for Service

This package contains code required to communicate with the database built using Prisma

Currently built on top of High-level functions but will transition to using NestJs modules in the future.

## Connecting to PlanetScale

PlanetScale is used as the default database-as-a-service provider for this project. To connect to it,
download the [PlanetScale CLI](https://github.com/planetscale/cli#installation) (You will need an account).

Then if you haven't already, create a database using PlanetScale and you can then connect to it locally using the command:

```bash
$ pscale connect <database> <branch> --port 3309
```

This will open a local proxy to your database