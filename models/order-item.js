const { sequelize, DataTypes, Sequelize } = require("../util/database");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    quantity: DataTypes.INTEGER
  },
  {
    timestamps: true,
  }
);

module.exports = OrderItem;
