import chalk from "chalk";
import { createClient } from "redis";


export const redisClient = createClient({
  url: "redis://localhost:6379",
});

redisClient.on("error", (error) => {
  console.error(chalk.red("redis client error: ", error));
});

export const createRedisConnection = async () => {
  try {
    await redisClient.connect();
    console.log(chalk.green("redis client connection successful"));
  } catch (err) {
    console.error(chalk.red("redis connection failed"));
    process.exit(1);
  }
};
