import convict from 'convict';
import yaml from 'js-yaml';
import json5 from 'json5';
convict.addParser([
  { extension: 'json', parse: JSON.parse },
  { extension: ['yaml', 'yml'], parse: yaml.safeLoad },
  { extension: ['json5'], parse: json5.parse },
]);

function logLevel(options) {
  return {
    doc: 'The level of logging to be recorded',
    format: ['error', 'info', 'verbose', 'debug', 'silly'],
    ...options,
  };
}

function logPath(options) {
  return {
    doc: 'Where the logs will be recorded to',
    ...options,
  };
}

export const schema = convict({
  env: {
    env: 'NODE_ENV',
    format: ['production', 'development', 'test'],
    arg: 'env',
    default: 'development',
  },
  ui: {
    protocol: {
      env: 'UI_PROTOCOL',
      arg: 'ui-protocol',
      format: ['http', 'https'],
      default: 'http',
    },
    host: {
      doc: 'The host used for hosting the frontend web app',
      env: 'UI_HOST',
      format: '*',
      arg: 'ui-host',
      default: 'localhost',
    },
    port: {
      doc: 'The port number used for hosting the frontend web app',
      env: 'UI_PORT',
      format: 'port',
      arg: 'ui-port',
      default: 3000,
    },
  },
  server: {
    log: {
      /*
        TODO: Rather than having a config for this we could probably allow have hooks 
        to add loggers straight into winston
      */
      console: {
        level: logLevel({
          default: 'info',
          env: 'CONSOLE_LOG_LEVEL',
          arg: 'console-log-level',
        }),
      },
      file: {
        level: logLevel({
          default: 'verbose',
          env: 'FILE_LOG_LEVEL',
          arg: 'file-log-level',
        }),
        path: {
          default: './openapi-platform-server.log',
          env: 'FILE_LOG_PATH',
          arg: 'file-log-path',
        },
      },
      error: {
        path: logPath({
          default: './openapi-platform-server.error.log',
          env: 'ERROR_LOG_PATH',
          arg: 'error-log-path',
        }),
      },
    },
    protocol: {
      env: 'SERVER_PROTOCOL',
      arg: 'server-protocol',
      format: ['http', 'https'],
      default: 'http',
    },
    host: {
      doc: 'The accepted address for connects to the server',
      default: 'localhost',
      env: 'SERVER_HOST',
      arg: 'server-host',
    },
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
