require("reflect-metadata");
const express = require("express");
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { AppDataSource } = require("./config/data-source");
const userRoutes = require("./routes/userRoutes");
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


app.use("/api/", userRoutes);

// Initialize server
AppDataSource.initialize()
  .then(() => {
    console.log("Database Connected Successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${URL}:${PORT}`);
      console.log(`CORS enabled for origin: ${FRONTEND_ORIGIN}`);
    });
  })
  .catch((err) => console.error("Database connection error:", err));