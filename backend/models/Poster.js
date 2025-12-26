const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Poster = sequelize.define("Poster", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  qrCodeUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  scanCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: "posters"
});

module.exports = Poster;