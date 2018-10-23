import program from 'commander';

import { Spec, SdkConfig, HasId } from '@openapi-platform/model';
import { generateSdk } from '@openapi-platform/openapi-sdk-gen-client';

import { client, socket } from './client';
import { config } from './config';
import { logger } from './logger';

export async function buildSpecs(specId: string, sdkConfigs: string[]) {
  let specs: Array<HasId<Spec>>;
  if (specId === '*') {
    specs = await client
      .service('specifications')
      .find({
        query: {
          $sort: {
            createdAt: 1,
          },
        },
      })
      .catch(err => {
        if (err.name === 'Timeout') {
          logger.error(
            `Unable to connect to server on port ${config.get('server.port')}`,
          );
        } else {
          logger.error(err);
        }
      });
  } else {
    const spec: HasId<Spec> = await client
      .service('specifications')
      .get(specId)
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
    specs = [spec];
  }
  socket.disconnect();
  if (specs.length > 0) {
    for (const spec of specs) {
      buildSpecConfigs(spec, sdkConfigs);
    }
  }
}

async function buildSpecConfigs(spec: HasId<Spec>, sdkConfigIds: string[]) {
  const sdkConfigs: Array<HasId<SdkConfig>> = await client
    .service('sdkConfigs')
    .find({
      query: {
        $sort: {
          createdAt: 1,
        },
        specId: spec.id,
      },
    })
    .catch(err => {
      if (err.name === 'Timeout') {
        logger.error(`Unable to connect to server on port ${config.get('server.port')}`);
      } else {
        logger.error(err);
      }
    });

  for (const sdkConfig of sdkConfigs) {
    if (sdkConfigIds.indexOf(sdkConfig.id.toString()) >= 0 || sdkConfigIds[0] === '*') {
      try {
        logger.info(await generateSdk(logger, spec, sdkConfig));
        logger.info(
          `Succesfully built SDK from specification: ${spec.id.toString()}, sdkConfig: ${sdkConfig.id.toString()}`,
        );
      } catch (err) {
        logger.error(
          `Failed to build SDK (specId: ${spec.id.toString()}, sdkConfigId: ${sdkConfig.id.toString()})`,
        );
      }
    }
  }
  socket.disconnect();
}

logger.info('builder');
program.parse(process.argv);

if (program.args.length > 1) {
  const specificationId = program.args[0];
  const sdkConfigs = program.args.slice(1, program.args.length);
  buildSpecs(specificationId, sdkConfigs);
} else {
  if (program.args.length === 0) {
    logger.error('Must specify one specification id and at least one sdk config id');
  } else {
    logger.error('Must specify at least one sdk config id');
  }
}
