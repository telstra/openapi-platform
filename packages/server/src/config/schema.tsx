import convict from 'convict';
const schema = convict({
  env: {
    env: 'NODE_ENV',
    format: ['production', 'development', 'test'],
    default: 'development',
  },
  server: {
    port: {
      doc: 'The port number used for incoming connections.',
      env: 'SERVER_PORT',
      format: 'port',
      default: 8080,
    },
    // TODO: You should be able to add this sort of stuff via some sort of hook
    useCors: {
      doc: 'Whether or not CORS requests should be allowed.',
      env: 'USE_CORS',
      format: Boolean,
      default: true,
    },
    // TODO: Would like to get rid of this field in favour of adding dummy data via scripts
    initDummyData: {
      doc: 'Whether or not dummy data should be created for development purposes.',
      env: 'INIT_DUMMY_DATA',
      format: Boolean,
      default: false,
    },
  },
  database: {
    name: {
      doc: 'The name of the PostgreSQL database to connect to.',
      env: 'DATABASE_NAME',
      format: String,
      default: undefined,
    },
    host: {
      doc: 'The hostname of the PostgreSQL database to connect to.',
      env: 'DATABASE_HOST',
      format: '*',
      default: undefined,
    },
    port: {
      doc: 'The port of the PostgreSQL database to connect to.',
      env: 'DATABASE_PORT',
      default: 5432,
      format: 'port',
    },
    username: {
      doc: 'The username of the PostgreSQL database to connect to.',
      env: 'DATABASE_USERNAME',
      format: String,
      default: undefined,
    },
    password: {
      doc: 'The password of the PostgreSQL database to connect to.',
      env: 'DATABASE_PASSWORD',
      format: String,
      default: undefined,
    },
  },
});
export { schema };
