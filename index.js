import dotenv from "dotenv";
dotenv.config();
import express from "express";
import router from "./Routes/routes.js";
import { sequelize, connectDB } from "./database/dbConn.js";
import { createRedisConnection } from "./database/redisConn.js";
import "./models/index.js";
import cookieParser from "cookie-parser";
import chalk from "chalk";
import cors from 'cors'

const app = express();
app.use(cors({
  origin: process.env.DEVELOPMENT, //TODO
  credentials: true
}))
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", router);

try {
  await connectDB();
  await sequelize.sync();
  await createRedisConnection();

  app.listen(PORT, () => {
    console.log(chalk.green(`App running on port ${PORT}`));
    console.log(chalk.yellowBright(`Our db is ${process.env.DB_NAME}`));
  });
} catch (error) {
  console.error(chalk.redBright("Error starting server"));
}
