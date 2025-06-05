require("reflect-metadata");
const express = require("express");
require('dotenv').config();
const { AppDataSource } = require("./config/data-source");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT;

// Define frontend origin
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

// Configure CORS before defining routes
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define API routes
app.use("/api/", userRoutes);

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log("Database Connected Successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port http://localhost:${PORT}`);
      console.log(`CORS enabled for origin: ${FRONTEND_ORIGIN}`);
    });
  })
  .catch((err) => console.error("Database connection error:", err));