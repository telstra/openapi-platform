import program from 'commander';

import { readConfig } from '@openapi-platform/config';
import { createServerClient } from '@openapi-platform/server-client';

import { logger } from './logger';

async function getItems(type: string) {
  const config = readConfig();
  const { client, socket } = createServerClient(
    `http://localhost:${config.get('server.port')}`,
  );
  const itemIds = await client
    .service(type)
    .find({
      query: {
        $sort: {
          createdAt: 1,
        },
      },
    })
    .catch(err => {
      if (err.name === 'Timeout') {
        logger.error(`Unable to connect to server on port ${config.get('server.port')}`);
      } else {
        logger.error(err);
      }
    });
  socket.disconnect();
  return itemIds;
}

async function listItems(type, filters) {
  if (['specifications', 'sdkConfigs', 'sdks'].indexOf(type) >= 0) {
    const items = await getItems(type);
    for (const item of items) {
      logger.info(item);
    }
  } else {
    logger.error(
      `Invalid type '${type}'. Supported types: 'specifications', 'sdkConfigs', 'sdks'`,
    );
  }
}

program.parse(process.argv);

const itemType = program.args[0];
const itemFilters = program.args.slice(1, program.args.length);

listItems(itemType, itemFilters);
