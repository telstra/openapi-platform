/*
  Script for adding sample data to the database.
  Also option to clear data from db.
  Requires openapi-platform server to be running.
*/

const { createServerClient } = require('@openapi-platform/server-client');
const { readConfig } = require('@openapi-platform/config');
const { openapiLogger, consoleTransport } = require('@openapi-platform/logger');
const { addDummyData } = require('./addDummyData');

// TODO: Make this configurable
const logger = openapiLogger().add(consoleTransport({ level: 'verbose' }));

async function clearDatabase(client) {
  const serviceNames = ['specifications', 'sdks', 'sdkConfigs'];
  for (const serviceName of serviceNames) {
    const service = client.service(serviceName);
    const documents = await service.find();
    for (const doc of documents) {
      logger.verbose(`removing id: ${doc.id}`);
      logger.verbose(doc);
      await service.remove(doc.id);
    }
  }
}

async function insertSampleData(client) {
  await addDummyData(client.service('specifications'), client.service('sdkConfigs'));
}

async function run() {
  const config = readConfig();
  const { client, socket } = createServerClient(
    `http://localhost:${config.get('server.port')}`,
  );
  try {
    let clear = true;
    let populate = false;
    let verbose = false;
    let port = 8080;
    process.argv.forEach(function(val, index, array) {
      switch (val.toLowerCase()) {
        case '--noclear':
          clear = false;
          break;
        case '--populate':
          populate = true;
          break;
      }
    });

    if (clear) {
      logger.info('Resetting Database.');
      await clearDatabase(client);
      logger.info('Done.');
    }

    if (populate) {
      logger.info('Populating database with sample data.');
      await insertSampleData(client);
      logger.info('Done.');
    }
  } catch (err) {
    logger.error(err);
  } finally {
    socket.disconnect();
  }
}

run();
