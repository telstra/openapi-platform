import sequelize from 'feathers-sequelize';
import Sequelize from 'sequelize';

/**
 * Creates a Sequelize database model for storing an SDK configuration.
 *
 * @param dbConnection The Sequelize connection to create the model for.
 * @returns The created Sequelize model.
 */
export function createSdkConfigModel(dbConnection: Sequelize.Sequelize) {
  return dbConnection.define(
    'sdk_configs',
    {
      specId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      target: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      version: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      options: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      gitInfo: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      buildStatus: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
    },
  );
}

/**
 * Creates a Feathers service to access SDK configuration, using the given database model.
 *
 * @param sdkConfigModel The database model representing an SDK configuration.
 * @returns The created Feathers service.
 */
export function createSdkConfigService(sdkConfigModel) {
  const service = sequelize({
    Model: sdkConfigModel,
  });
  service.docs = {
    description:
      'The SDK configurations used for generating SDKs according to a given ' +
      'specification',
    definitions: {
      sdkConfigs: {
        type: 'object',
        properties: {
          specId: {
            type: 'integer',
            format: 'int64',
            description: 'ID of the specification associated with the SDK configuration',
          },
          target: {
            type: 'string',
            description: 'Language that the plan will generate an SDK for',
          },
          version: {
            type: 'string',
            description: 'The version number of the SDK',
          },
          options: {
            type: 'object',
            description: 'Additional options for the plan',
            additionalProperties: true,
          },
          gitinfo: {
            type: 'object',
            description: 'Used as a repository to push SDKs to',
            additionalProperties: true,
          },
          buildStatus: {
            type: 'string',
            description: 'The status of the build',
          },
        },
        additionalProperties: true,
      },
      'sdkConfigs list': {
        type: 'array',
        items: {
          $ref: '#definitions/plans',
        },
      },
    },
  };
  return service;
}
