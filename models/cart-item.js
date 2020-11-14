const { sequelize, DataTypes, Sequelize } = require("../util/database");

const CartItem = sequelize.define(
  "CartItem",
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

module.exports = CartItem;
