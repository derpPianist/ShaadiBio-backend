import jwt from "jsonwebtoken";
import { redisClient } from "../database/redisConn.js";
import chalk from "chalk";

export const authMiddleware = async (req, res, next) => {
  try {
    const accessHeader = req.headers.authorization;

    if (!accessHeader) {
      return res.status(401).json({ message: "No token detected" });
    }

    const accessToken = accessHeader.split(" ")[1];

    // Check blacklist BEFORE verify
    const isBlacklisted = await redisClient.get(`bl_${accessToken}`);
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token has been revoked" });
    }

    // Verify and assign correctly
    const verifiedToken = jwt.verify(accessToken, process.env.JWT_SECRET);

    req.user = verifiedToken;
    console.log(chalk.yellow("req.user: ", req.user));

    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};