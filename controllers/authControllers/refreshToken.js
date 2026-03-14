import jwt from "jsonwebtoken";
import Refresh_Session from "../../models/refreshSession.model.js";
import crypto from "node:crypto";
import UserAccount from "../../models/userAccounts.model.js";
import { createAccessToken } from "../../utils/accessTokenGenerator.js";
import { createRefreshToken } from "../../utils/refreshTokenGererator.js";

export const refreshToken = async (req, res) => {
  //Extract refresh token and do the checks for presence of token
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "unauthorized user, user must ne logged in to use this function",
    });
  }

  //Check our sessions db to see if the token is not blacklisted
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const blacklistedToken = await Refresh_Session.findOne({
    where: { hashed_token: hashedRefreshToken },
  });

  if (!blacklistedToken){
    return res.status(403).json({ message: "Token not recognised" }); //the req accessing this service will definitely have a refresh token
  }

  if (blacklistedToken.revoked === true) {

    await Refresh_Session.update(
        {revoked: true},
        {where: { userId: blacklistedToken.userId}} //cancel all sessions of the breached user
    )
    return res.status(403).json({
      message:
        "Detected blacklisted refresh token, this incident will be reported. All seesions have been revoked",
    });
  }

  //check if the token itself is valid
  let verifiedToken;

  try {
    verifiedToken = jwt.verify(refreshToken, process.env.JWT_REFRESH);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Expired Token, please log in again",
      });
    }
  }

  // If our token passes all checks then we will blacklist it now
  const [updatedRows] = await Refresh_Session.update(
    { revoked: true },
    { where: { hashed_token: hashedRefreshToken } },
  );

  if (updatedRows === 0) {
    console.log("No refresh session matched");
  }

  //now we create new tokens
  const account = await UserAccount.findByPk(verifiedToken.sub);

  if(!account){
    return res.status(401).json({ message: "User not found" });
  }

  const newAccessToken = await createAccessToken(account);
  const newRefreshToken = await createRefreshToken(account);

  const newHashedRefreshToken = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  const deviceIP =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    null;

  // create a new log for our newly issued token
  await Refresh_Session.create({
    userId: account.userId,
    hashed_token: newHashedRefreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    deviceIPV4: deviceIP,
  });

  //return our tokens
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: false, //to-do: set to true when deploying in prod
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    message: "token successfully refreshed",
    accessToken: newAccessToken
  })
};