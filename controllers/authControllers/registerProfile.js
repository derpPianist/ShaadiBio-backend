import { validatePassword } from "../../utils/validatePassword.js";
import { validatePhoneNumber } from "../../utils/validatePhoneNumber.js";
import { hashedText } from "../../utils/hashing.js";
import UserAccount from "../../models/userAccounts.model.js";

export default async function UserRegister(req, res) {
  const requiredFields = [
    "full_name",
    "email",
    "password",
    "phone_number",
    "gender",
    "date_of_birth",
    "city"
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
    where: { phone_number: req.body.phone_number}
  })

  if(existingUserPhone){
    return res.status(409).json({ error: "Phone already registered"})
  }

  const hashedPassword = await hashedText(req.body.password);

  const account = {
    full_name: req.body.full_name,
    email: req.body.email,
    password: hashedPassword,
    phone_number: req.body.phone_number,
    gender: req.body.gender,
    date_of_birth: req.body.date_of_birth,
    city: req.body.city
  };

  try {
    const createdAccount = await UserAccount.create(account);

    const { password, confirmPassword, ...accountData } = createdAccount.toJSON();

    return res.status(201).json({
      message: "Account registered successfully",
      User_Details: accountData,
    });
    
  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Something went wrong",
    });
  }
}
