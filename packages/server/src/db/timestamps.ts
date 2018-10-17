import Sequelize from 'sequelize';
export const timestamps = {
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: Sequelize.DATE,
    // This only becomes non-null after something gets edited for the first time
    allowNull: true,
  },
};
