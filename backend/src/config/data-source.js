require("dotenv").config();
const { DataSource } = require("typeorm");
const { User } = require("../entities/User");
const { OTP } = require("../entities/otp");
const { ActivityLog } = require("../entities/ActivityLog");

const entities = [User, OTP, ActivityLog];


const AppDataSource = new DataSource({
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: entities,
});

module.exports = { AppDataSource };
