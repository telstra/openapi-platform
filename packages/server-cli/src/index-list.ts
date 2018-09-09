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
      logger.error('Unable to connect to server');
    });
  socket.disconnect();
  return itemIds;
}

program
  .command('list [type] [filters...]', 'List items in db')
  .action(async (type, filters) => {
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
  });

program.parse(process.argv);
