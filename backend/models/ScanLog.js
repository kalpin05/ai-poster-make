const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ScanLog = sequelize.define("ScanLog", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  posterId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  scannedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "scan_logs"
});

module.exports = ScanLog;