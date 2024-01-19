# XR-archaeology-server

This is the backend for XR-archaeology-app.

## To initialize the docker container

1. Create the mongodb container and start running the server

    ``` bash
    yarn build
    ```

2. Log on to mongo express
   go to <http://localhost:8081/>
   log on using credentials set in .env(ME_CONFIG_BASICAUTH_USERNAME, ME_CONFIG_BASICAUTH_PASSWORD)

## To run the docker container

``` bash
yarn start
```

1. Log on to mongo express
   go to <http://localhost:8081/>
   log on using credentials set in .env(ME_CONFIG_BASICAUTH_USERNAME, ME_CONFIG_BASICAUTH_PASSWORD)

## Folder Structures

+ components: our own UI components
+ node_modules: installed public libraries
+ pages: content of different web pages
+ server: server configuration
  + api:
    + public: API for common users
    + services: API for admin users
  + db: database schema
  + feathers: for database initialize and query
+ contexts: our own react contexts
+ types: TypeScript files
+ config.json: website configuration details
+ package.json: libraries
