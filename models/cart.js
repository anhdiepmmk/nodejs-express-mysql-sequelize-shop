const { sequelize, DataTypes, Sequelize } = require("../util/database");

const Cart = sequelize.define(
  "Cart",
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

module.exports = Cart;
