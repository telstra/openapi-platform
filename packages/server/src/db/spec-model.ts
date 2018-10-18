import sequelize from 'feathers-sequelize';
import Sequelize from 'sequelize';

/**
 * Creates a Sequelize database model for storing a specification.
 *
 * @param dbConnection The Sequelize connection to create the model for.
 * @returns The created Sequelize model.
 */
export function createSpecModel(dbConnection: Sequelize.Sequelize) {
  return dbConnection.define(
    'specifications',
    {
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      path: {
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
 * Creates a Feathers service to access specifications, using the given database model.
 *
 * @param sdkConfigModel The database model representing a specification.
 * @returns The created Feathers service.
 */
export function createSpecService(specModel) {
  const service = sequelize({
    Model: specModel,
  });
  service.docs = {
    description: 'OpenAPI specifications to generate SDKs from',
    definitions: {
      specs: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Name of the OpenAPI specification',
          },
          description: {
            type: 'string',
            description: 'Description of the OpenAPI specification',
          },
          path: {
            type: 'string',
            description: 'URL at which the OpenAPI specification can be found',
          },
        },
        additionalProperties: true,
      },
      'specs list': {
        type: 'array',
        items: {
          $ref: '#definitions/specs',
        },
      },
    },
  };
  return service;
}
