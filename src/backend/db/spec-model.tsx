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
 * @param planModel The database model representing a specification.
 * @returns The created Feathers service.
 */
export function createSpecService(specModel) {
  const service = sequelize({
    Model: specModel,
  });
  service.docs = {
    description: 'Swagger/OpenAPI specs',
    definitions: {
      specifications: {
        type: 'object',
        additionalProperties: true,
      },
      'specifications list': {
        type: 'array',
      },
    },
  };
  return service;
}
