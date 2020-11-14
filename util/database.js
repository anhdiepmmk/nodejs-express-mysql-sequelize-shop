const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("nodejs-course", "root", "123", {
  dialect: "mysql",
  host: "localhost",
  logging: false
});

module.exports = {sequelize, Sequelize, DataTypes}
