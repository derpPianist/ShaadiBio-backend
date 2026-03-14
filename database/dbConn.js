import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
import chalk from "chalk";
dotenv.config()


export const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  dialect: "postgres",
  host: process.env.DB_HOST,
});

export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log(chalk.green("Connection has been established successfully."));
  } catch (error) {
    console.error(chalk.red("Unable to connect to the database:", error));
  }
}
