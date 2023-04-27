# Consent As A Service

Monorepo for the Consent as a Service (CAAS) Platform

## What is it?
Consent as a Service (CAAS) is a web service designed to manage consents for user data. Its purpose is to act as an intermediary between an online service and the end user. The objective of this platform is to improve trust levels when using online services. This stems from the idea that if the user can trust the platform (CAAS) then by extension, they’re able to trust the service on the other end. This is done by providing the service with APIs which can be used to construct consent requests which consists of data types for the forms of data to be gathered.

## What's inside?
Consent As A Service (CAAS) is an Open Platform designed to manage and store consents for users

This turborepo uses [pnpm](https://pnpm.io) as a package manager. It includes the following packages/apps:

### Apps and Packages

- `server`: a [Nest.js](https://nestjs.com/) app which provides the service implementation 
- `docs`: a [Next.js](https://nextjs.org/) app which hosts documentation
- `web`: another [Next.js](https://nextjs.org/) app which provides the 'user' frontend to the platform-service
- `ui`: a stub React component library shared by both `web` and `docs` applications
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo
- `domain`: Common Library hosting domain definitions, validators etc.
- `database-prisma`: a [Prisma.js](https://prisma.io) library with the data-access implementation

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### External Utilities

 - `auth0`: Authentication

### Build

To build all apps and packages, run the following command:

```
cd consent-as-a-service
pnpm run build
```

### Develop

To Start a live development environment run:

```
cd consent-as-a-service
pnpm run dev
```
Additionally, packages may have their own setup requirements

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
cd consent-as-a-service
pnpm dlx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your turborepo:

```
pnpm dlx turbo link
```
