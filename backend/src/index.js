require("reflect-metadata");
const express = require("express");
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { AppDataSource } = require("./config/data-source");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminController = require("./controllers/adminController");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT;
const URL = process.env.APP_URL;

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/", userRoutes);
app.use("/api/admin", adminRoutes);

// Initialize server
AppDataSource.initialize()
  .then(async () => {
    console.log("Database Connected Successfully");
    
    // Seed activity logs for testing
    await adminController.seedActivityLogs(15);
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${URL}:${PORT}`);
      console.log(`CORS enabled for origin: ${FRONTEND_ORIGIN}`);
    });
  })
  .catch((err) => console.error("Database connection error:", err));