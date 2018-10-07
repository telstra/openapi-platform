# openapi-platform
Project in development - Open sourced service overlay for SDK management using swagger-codegen

# Minimum Requirements
- Node 8.x
- PostgreSQL

## Installation
```
npm install --global @openapi-platform/frontend @openapi-platform/server
```
or
```
yarn add global @openapi-platform/frontend @openapi-platform/server
```

## How to use it
1. Run `start-openapi-platform-server`
2. Run `start-openapi-platform-frontend`

## Configuration
You can create a config file in your current working directory called `openapi-platform.config.xxx` where xxx is a `json`, `yaml` or `json5`. 
For more detailed information about configuration, you can check the `node-convict` [schema file](./packages/config/src/schema.ts).
