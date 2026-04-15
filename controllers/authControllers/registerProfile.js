import { validatePassword } from "../../utils/validatePassword.js";
import { validatePhoneNumber } from "../../utils/validatePhoneNumber.js";
import { hashedText } from "../../utils/hashing.js";
import UserAccount from "../../models/userAccounts.model.js";
import crypto from "node:crypto";
import { otpModel } from "../../models/otp.model.js";
import sendOtpByMail from "../../utils/sendOtpByMail.js";

export default async function UserRegister(req, res) {
  //  VERIFY IF ALL FIELDS EXIST AND ARE CORRECT

  const requiredFields = [
    "full_name",
    "email",
    "password",
    "phone_number",
    "gender",
    "date_of_birth",
    "city",
  ];

  const missingFields = requiredFields.filter(
    (field) =>
      req.body[field] == null ||
      req.body[field] === "" ||
      req.body[field] === undefined,
  );

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: "Missing required fields",
      missing: missingFields,
    });
  }

  const passwordCheck = validatePassword(req.body.password);

  if (!passwordCheck.valid) {
    return res.status(400).json({ error: passwordCheck.error });
  }

  const phoneCheck = validatePhoneNumber(req.body.phone_number);

  if (!phoneCheck.valid) {
    return res.status(400).json({ error: phoneCheck.error });
  }

  const existingUser = await UserAccount.findOne({
    where: { email: req.body.email },
  });

  if (existingUser) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const existingUserPhone = await UserAccount.findOne({
    where: { phone_number: req.body.phone_number },
  });

  if (existingUserPhone) {
    return res.status(409).json({ error: "Phone already registered" });
  }

  const hashedPassword = await hashedText(req.body.password);

  // CREATE TEMPORARY ACCOUNT AND CREATE+SEND OTP

  const randInt = crypto.randomInt(100000, 999999).toString();

  const hashedOtp = await hashedText(randInt);

  const timeOfExpiry = new Date(Date.now() + 300000);

  const account = {
    full_name: req.body.full_name,
    email: req.body.email,
    password_hash: hashedPassword,
    phone_number: req.body.phone_number,
    gender: req.body.gender,
    date_of_birth: req.body.date_of_birth,
    city: req.body.city,
    hashed_otp: hashedOtp,
    attempt_count: 0,
    expires_at: timeOfExpiry,
  };

  console.log("OTP: ", randInt);

  try {
    const tempAccount = await otpModel.create(account);

    // try {
    //   const otpResponse = await sendOtp(randInt, tempAccount.phone_number);

    //   console.log("OTPResponse: ", otpResponse);

    //   if (otpResponse && otpResponse.return === true) {
    //     return res.status(200).json({
    //       message: "OTP sent to phone",
    //       response: otpResponse.request_id,
    //     });
    //   }

    //   if (!otpResponse || typeof otpResponse !== "object") {
    //     console.error("Invalid SMS response:", otpResponse);

    //     return res.status(500).json({
    //       message: "Invalid response from SMS provider",
    //     });
    //   }

    //   console.error("SMS failed:", otpResponse);

    //   return res.status(500).json({
    //     message: otpResponse.message || "SMS failed",
    //   });
      
    // } catch (error) {
    //   console.error("Error throwing otp: ", error);
    //   await tempAccount.destroy();
    //   return res.status(500).json({
    //     message: "Problem in sms generation",
    //   });
    // }

    // sending otp via email

    try {
      const response = await sendOtpByMail(randInt, tempAccount.email)

      if(response && response.response.includes('250')){
        return res.status(200).json({
          message: `Otp send successfully at ${tempAccount.email}`,
          msgId: response.response.messageId, 
        })
      }
    } catch (error) {
      console.error("Error Sending OTP: ", error)
      return res.status(500).json({
        message: "Something went wrong at sending OTP by mail, please try again later",
        error: error
      })
    }

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong at sending OTP" });
  }

}
