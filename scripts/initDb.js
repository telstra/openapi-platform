/*
Script for adding sample data to the database.
Also option to clear data from db.
Requires openapi-platform server to be running.
*/

const { createServerClient } = require('@openapi-platform/server-client');
const { readConfig } = require('@openapi-platform/config');

const { addDummyData } = require('./addDummyData');

async function clearDatabase(client) {
  const serviceNames = ['specifications', 'sdks', 'sdkConfigs'];
  for (const serviceName of serviceNames) {
    const service = client.service(serviceName);
    const documents = await service.find();
    for (const document of documents) {
      console.log(`removing id: ${document.id}`);
      console.log(document);
      await service.remove(document.id);
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
      console.log('Resetting Database.');
      await clearDatabase(client);
      console.log('Done.');
    }

    if (populate) {
      console.log('Populating database with sample data.');
      await insertSampleData(client);
      console.log('Done.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    socket.disconnect();
  }
}

run();
