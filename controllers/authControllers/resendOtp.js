import crypto from "node:crypto";
import { otpModel } from "../../models/otp.model.js";
import { hashedText } from "../../utils/hashing.js";
import sendOtpByMail from "../../utils/sendOtpByMail.js";

export default async function resendOtp(req, res) {
  try {
    const { phone_number } = req.body;

    const response = await otpModel.findOne({
      where: { phone_number: phone_number },
    });

    if (response) {
      const currentAttemptCounts = response.attempt_count;

      if (currentAttemptCounts >= 3) {
        return res.status(403).json({
          message: "Maximum attempts exceeded, try again later",
        });
      }

      const attemptCount = await response.increment("attempt_count");

      console.log("attempt_count", attemptCount);

      await response.reload();

      const randInt = crypto.randomInt(100000, 999999).toString();

      console.log("Otp: ", randInt);

      const hashedOtp = await hashedText(randInt);

      const timeOfExpiry = new Date(Date.now() + 300000);

      const updateResponse = await response.update({
        hashed_otp: hashedOtp,
        expires_at: timeOfExpiry,
      });

      console.log("UpdatedResponse: ", updateResponse.dataValues);

      // try {
      //   const otpResponse = await sendOtp(randInt, phone_number);

      //   if (otpResponse.return === true) {
      //     return res.status(200).json({
      //       message: "New OTP sent to phone",
      //       response: otpResponse.request_id,
      //     });
      //   } else {
      //     return res.status(500).json({
      //       message: otpResponse.message,
      //     });
      //   }
      // } catch (error) {
      //   console.error("error: ", error);
      //   return res.status(500).json({ message: "Failed to send OTP" });
      // }

      try {
        const SMTPresponse = await sendOtpByMail(randInt, updateResponse.email);

        if (SMTPresponse && SMTPresponse.response.includes("250")) {
          return res.status(200).json({
            message: `Otp send successfully at ${updateResponse.email}`,
            msgId: SMTPresponse.response.messageId,
          });
        }
      } catch (error) {
        console.error("Error Sending OTP: ", error);
        return res.status(500).json({
          message:
            "Something went wrong at sending OTP by mail, please try again later",
          error: error,
        });
      }
    } else {
      return res.status(400).json({
        message: "Unable to send OTP",
      });
    }
  } catch (error) {
    console.error("Error: ", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}
