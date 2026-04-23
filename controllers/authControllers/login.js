import Refresh_Session from "../../models/refreshSession.model.js";
import UserAccount from "../../models/userAccounts.model.js";
import { createAccessToken } from "../../utils/accessTokenGenerator.js";
import { comparePassword } from "../../utils/comparePassword.js";
import crypto from "crypto";
import { createRefreshToken } from "../../utils/refreshTokenGererator.js";
import chalk from "chalk";

export default async function jwtLogin(req, res) {
  try {
    const body = req.body;

    console.log("Body for login: ", body)

    const findAccount = await UserAccount.findOne({
      where: { email: body.email },
    });

    console.log(chalk.green("findAccount: "), findAccount.dataValues);

    if (!findAccount || findAccount === null) {
      return res.status(401).json({
        message: "Account not found in database", 
      });
    }

    if (!(await comparePassword(body.password, findAccount.password))) {
      return res.status(401).json({
        message: "Incorrect password, please enter the correct password",
      });
    }

    const accessToken = await createAccessToken(findAccount);
    const refreshToken = await createRefreshToken(findAccount);

    const { password, ...userAccount} = findAccount.toJSON()

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const deviceIP =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      null;

    await Refresh_Session.create({
      userId: findAccount.userId,
      hashed_token: tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceIPV4: deviceIP,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, //TODO: set to true when deploying in prod
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login Successful",
      accessToken: accessToken,
      account: userAccount
    });
  } catch (error) {

    console.log("Error: ", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
}
