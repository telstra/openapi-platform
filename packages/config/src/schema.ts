import convict from 'convict';
import yaml from 'js-yaml';
import json5 from 'json5';
convict.addParser([
  { extension: 'json', parse: JSON.parse },
  { extension: ['yaml', 'yml'], parse: yaml.safeLoad },
  { extension: ['json5'], parse: json5.parse },
]);
export const schema = convict({
  env: {
    env: 'NODE_ENV',
    format: ['production', 'development', 'test'],
    arg: 'env',
    default: 'development',
  },
  ui: {
    port: {
      doc: 'The port number used for hosting the frontend web app',
      env: 'UI_PORT',
      format: 'port',
      default: 3000,
    },
  },
  server: {
    port: {
      doc: 'The port number used for incoming connections.',
      env: 'SERVER_PORT',
      arg: 'server-port',
      format: 'port',
      default: 8080,
    },
    // TODO: You should be able to add this sort of stuff via some sort of hook
    useCors: {
      doc: 'Whether or not CORS requests should be allowed.',
      env: 'USE_CORS',
      arg: 'use-cors',
      format: Boolean,
      default: true,
    },
  },
  database: {
    name: {
      doc: 'The name of the PostgreSQL database to connect to.',
      env: 'DB_NAME',
      arg: 'db-name',
      format: String,
      default: undefined,
    },
    host: {
      doc: 'The hostname of the PostgreSQL database to connect to.',
      env: 'DB_HOST',
      arg: 'db-host',
      format: '*',
      default: undefined,
    },
    port: {
      doc: 'The port of the PostgreSQL database to connect to.',
      env: 'DB_PORT',
      arg: 'db-port',
      default: 5432,
      format: 'port',
    },
    username: {
      doc: 'The username of the PostgreSQL database to connect to.',
      env: 'DATABASE_USERNAME',
      arg: 'db-username',
      format: String,
      default: undefined,
      sensitive: true,
    },
    password: {
      doc: 'The password of the PostgreSQL database to connect to.',
      env: 'DATABASE_PASSWORD',
      arg: 'db-password',
      format: String,
      default: undefined,
      sensitive: true,
    },
  },
});
