import { otpModel } from "../../models/otp.model.js";
import Refresh_Session from "../../models/refreshSession.model.js";
import UserAccount from "../../models/userAccounts.model.js";
import { createAccessToken } from "../../utils/accessTokenGenerator.js";
import { comparePassword } from "../../utils/comparePassword.js";
import { createRefreshToken } from "../../utils/refreshTokenGererator.js";
import crypto from "crypto";

export default async function verifyOtp(req, res) {
  //Extraction of phone & otp then basic error checking

  const { otp, email } = req.body;

  if (!otp || !email) {
    return res.status(400).json({
      message: "please enter otp",
    });
  }

  try {

    // get the necessary account details

    const accountDetails = await otpModel.findOne({
      where: { email: email },
    });

    // console.log(accountDetails);

    // Account creation / otp resending after verification of otp

    if (accountDetails) {

      // check if all attempts failed or not 

      if (accountDetails.attempt_count >= 3) {
        return res.status(403).json({
          message: "Maximum attempts exceeded, please try again later",
        });
      }

      // check password and dates

      const result = await comparePassword(otp, accountDetails.hashed_otp);

      console.log("result: ", result);

      const isExpired =
        Date.now() > new Date(accountDetails.expires_at).getTime();

      console.log("Expired: ", isExpired);

      // if otp verification successful (otp is correct and is within valid time interval)

      if (result && !isExpired) {
        const account = {
          full_name: accountDetails.full_name,
          email: accountDetails.email,
          password: accountDetails.password_hash,
          phone_number: accountDetails.phone_number,
          gender: accountDetails.gender,
          date_of_birth: accountDetails.date_of_birth,
          city: accountDetails.city,
        };

        const createdAccount = await UserAccount.create(account);

        const { password, ...resultingAccount } = createdAccount.toJSON();

        //destroy the otp session if successfully verified

        await otpModel.destroy({ where: { email: email } });

        //login to dashboard after successful deletion

        const accessToken = createAccessToken(resultingAccount);
        const refreshToken = createRefreshToken(resultingAccount);

        const tokenHash = crypto
          .createHash("sha256")
          .update(refreshToken)
          .digest("hex");

        const deviceIP =
          req.headers["x-forwarded-for"]?.split(",")[0] ||
          req.socket.remoteAddress ||
          null;

        const refreshSession = await Refresh_Session.create({
          userId: resultingAccount.userId,
          hashed_token: tokenHash,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          deviceIPV4: deviceIP,
        });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false, // todo: set to true in prod
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
          message: "Account created!",
          account: resultingAccount,
          refreshSession: refreshSession,
          accessToken: accessToken,
        });
      } else {
        // in case of otp expiry/incorrect otp

        const attemptNumber = await accountDetails.increment("attempt_count");

        console.log("attempt no: ", attemptNumber);

        const message = result && isExpired ? "OTP Expired" : "Invalid OTP";

        return res.status(400).json({
          message: message,
        });
      }
    } else {

      // if account not found

      return res.status(404).json({
        message: "Session not found",
      });
    }
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

/**
 * Flow of data in the function:
 *
 * 1. OTP and email are entered from the frontend
 * 2. Verified if an account exists with that email
 * 3. Verify the otp provided and the time of submission
 * 4. If all checks out, create an account, destroy the session, issue tokens
 * 5. on failure, return 400
 *
 */
