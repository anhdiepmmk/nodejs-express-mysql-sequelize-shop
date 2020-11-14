const { sequelize, DataTypes, Sequelize } = require("../util/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
  },
  {
    paranoid: true,
    timestamps: true,
  }
);

module.exports = User;
