import program from 'commander';

import { client, socket } from './client';
import { config } from './config';
import { specBuilder, configBuilder } from './itemBuilder';
import { logger } from './logger';

/**
 * Creates an item in the backend.
 * Manges Server client and closes connection afterwards to avoid the program not finishing
 */
async function createItem(serviceName, data) {
  const response = await client
    .service(serviceName)
    .create(data)
    .catch(err => {
      if (err.name === 'Timeout') {
        logger.error(`Unable to connect to server on port ${config.get('server.port')}`);
      } else {
        logger.error(err);
      }
    });
  socket.disconnect();
  return response;
}

/**
 * Switches the type being inserted based on command line inputs
 */
async function addItem(type: string, data: string) {
  switch (type.toLowerCase()) {
    case 'specification':
      await addSpec(data);
      break;

    case 'sdkconfig':
      await addConfig(data);
      break;
    default:
      logger.error(
        `Invalid type '${
          type
        }'. Supported types: 'specification', 'sdkconfig'`,
      );
      break;
  }
}

async function addSpec(data: string) {
  logger.info('Adding specification');
  if (data === '') {
    data = await specBuilder();
  }
  const response = await createItem('specifications', data);
  logger.info(response);
}

async function addConfig(data: string) {
  logger.info('Adding SDK Config');
  if (data === '') {
    data = await configBuilder();
  }
  const response = await createItem('sdkConfigs', data);
  logger.info(response);
}

export function addItems (type: string) {
  const stdin = process.stdin;

  if (!stdin.isTTY) {
    stdin.resume();
    stdin.setEncoding('utf8');

    stdin.on('data', chunk => {
      const data = JSON.parse(chunk);
      if (isArray(data)) {
        data.forEach(element => {
          addItem(type, element);
        });
      } else {
        addItem(type, data);
      }
    });
  } else {
    addItem(type, '');
  }
}

function isArray(what) {
  return Object.prototype.toString.call(what) === '[object Array]';
}
