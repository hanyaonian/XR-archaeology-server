# XR-archaeology-server

This is the backend for XR-archaeology-app.

## To begin the admin interface and server [DEV]

1. Configure yarn setting of `ignore-engines` to be `true`, if the version of yarn is 1.

   ```bash
   yarn preinstall
   ```

2. Create MongoDB instance on the local host

   ```bash
   yarn devMongo
   ```

3. Open a new terminal and start `mongosh` command

   ```bash
   mongosh
   ```

   Note: If this is the first time to initiate a MongoDB locally, run:

   ```mongosh
   rs.initiate()
   ```

4. Open a new terminal and start running the server

   ```bash
   yarn server:start
   ```

5. Open a new terminal and start running front-end

   ```bash
   yarn dev
   ```

## To initialize the docker container

1. Create the mongodb container and start running the server

   ```bash
   yarn build
   ```

2. Log on to mongo express
   go to <http://localhost:8081/>
   log on using credentials set in .env(ME_CONFIG_BASICAUTH_USERNAME, ME_CONFIG_BASICAUTH_PASSWORD)

## To run the docker container

```bash
yarn start
```

1. Log on to mongo express
   go to <http://localhost:8081/>
   log on using credentials set in .env(ME_CONFIG_BASICAUTH_USERNAME, ME_CONFIG_BASICAUTH_PASSWORD)

## Folder Structures

- components: our own UI components
- node_modules: installed public libraries
- pages: content of different web pages
- public: static assets
  - locales: our own locale translations
- layouts: wrappers of pages
- server: server configuration
  - api:
    - public: API for common users
    - services: API for admin users
  - db: database schema
  - feathers: for database initialize and query
- contexts: our own react contexts/providers
- types: TypeScript files
- config.json: website configuration details
- package.json: libraries

## Remark

- yarn version 1 is not able to resolve the package engine of sharp. Therefore, use `yarn add sharp --ignore-engines`
