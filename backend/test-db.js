const { Sequelize } = require("sequelize");

const db = new Sequelize("posterdb", "postgres", "admin", {
  host: "localhost",
  dialect: "postgres"
});

db.authenticate()
  .then(() => console.log("Connected to PostgreSQL successfully"))
  .catch(err => console.log("Connection error:", err));