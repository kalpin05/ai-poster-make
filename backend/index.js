const express = require("express");
const cors = require("cors");

const app = express();

// MIDDLEWARES — MUST COME BEFORE ROUTES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
const posterRoutes = require("./routes/poster");
app.use("/poster", posterRoutes);

// SERVER
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});