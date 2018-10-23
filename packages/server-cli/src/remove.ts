import program from 'commander';
import prompts from 'prompts';

import { client, socket } from './client';
import { config } from './config';
import { logger } from './logger';

async function removeItem(type: string, id: string, force: boolean) {
  // if not force prompt the user to confirm removal of item
  if (!force) {
    const item = await client
      .service(type)
      .get(id)
      .catch(err => {
        switch (err.name) {
          case 'NotFound':
            logger.error(err.message);
            break;
          case 'Timeout':
            logger.error(
              `Unable to connect to server on port ${config.get('server.port')}`,
            );
            break;
          default:
            logger.error(err);
            break;
        }
      });
    if (item) {
      logger.info(item);
      const response = await prompts({
        type: 'confirm',
        name: 'value',
        message: 'Are you sure you want to remove this?',
        initial: true,
      });
      if (!response.value) {
        // if confirm is false
        socket.disconnect();
        logger.info(`Skipped removing ${type} with id ${id}`);
        return;
      }
    } else {
      // no item found
      socket.disconnect();
      return false;
    }
  }

  // remove the item
  const status = await client
    .service(type)
    .remove(id)
    .catch(err => {
      switch (err.name) {
        case 'NotFound':
          logger.error(err.message);
          break;
        case 'Timeout':
          logger.error(
            `Unable to connect to server on port ${config.get('server.port')}`,
          );
          break;
        default:
          logger.error(err);
      }
    });
  if (status) {
    logger.info(`Removed ${type} with id ${id}`);
  }
  socket.disconnect();
  return status;
}

export async function remove(type: string, ids: string[]) {
  if (['specifications', 'sdkConfigs', 'sdks'].indexOf(type) >= 0) {
    if (ids.length === 0) {
      logger.error('No ids specified to remove');
    } else {
      // remove each item individually
      for (const id of ids) {
        await removeItem(type, id, program.force);
      }
    }
  } else {
    logger.error(
      `Invalid type '${type}'. Supported types: 'specifications', 'sdkConfigs', 'sdks'`,
    );
  }
}

