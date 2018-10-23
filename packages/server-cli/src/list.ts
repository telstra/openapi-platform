import { client, socket } from './client';
import { config } from './config';
import { logger } from './logger';

export async function getItems(type: string) {
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

export async function listItems(type, filters) {
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
