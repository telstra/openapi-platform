import sequelize from 'feathers-sequelize';
import Sequelize from 'sequelize';

/**
 * Creates a Sequelize database model for storing a plan.
 *
 * @param dbConnection The Sequelize connection to create the model for.
 * @returns The created Sequelize model.
 */
export function createPlanModel(dbConnection: Sequelize.Sequelize) {
  return dbConnection.define(
    'plans',
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
 * Creates a Feathers service to access plans, using the given database model.
 *
 * @param planModel The database model representing a plan.
 * @returns The created Feathers service.
 */
export function createPlanService(planModel) {
  const service = sequelize({
    Model: planModel,
  });
  service.docs = {
    description: 'The plans used for generating SDKs according to a given specification',
    definitions: {
      plans: {
        type: 'object',
        properties: {
          specId: {
            type: 'integer',
            format: 'int64',
            description: 'ID of the specification associated with the plan',
          },
        },
        additionalProperties: true,
      },
      'plans list': {
        type: 'array',
      },
    },
  };
  return service;
}
