import jwt from "jsonwebtoken";
import { redisClient } from "../../database/redisConn.js";
import Refresh_Session from "../../models/refreshSession.model.js";
import crypto from "node:crypto";
import chalk from "chalk";

export default async function logout(req, res) {
  try {
    console.log(chalk.blueBright("logout controller active"));

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization header missing",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token missing",
      });
    }

    const decodedAccessToken = jwt.decode(accessToken);

    if (!decodedAccessToken) {
      return res.status(401).json({
        message: "Invalid access token",
      });
    }

    const expiry = Math.max(
      decodedAccessToken.exp - Math.floor(Date.now() / 1000),
      0
    );

    const hashedRefreshToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    console.log(chalk.blueBright("tokens processed"));

    await redisClient.set(`bl_${accessToken}`, "blacklisted", {
      EX: expiry,
    });

    console.log(chalk.green("access token blacklisted"));

    const [updatedRows] = await Refresh_Session.update(
      { revoked: true },
      { where: { hashed_token: hashedRefreshToken } }
    );

    if (updatedRows === 0) {
      console.log("No refresh session matched");
    }

    console.log(chalk.green("refresh session revoked"));

    res.clearCookie("refreshToken");

    return res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (error) {
    console.error("Error during logout:", error);

    return res.status(500).json({
      message: "Something went wrong during logout",
    });
  }
}