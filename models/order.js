const { sequelize, DataTypes, Sequelize } = require("../util/database");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = Order;
