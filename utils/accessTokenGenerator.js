import jwt from "jsonwebtoken";

export const createAccessToken = (account) => {
  try {
    const payload = {
      sub: account.userId,
      email: account.email,
      gender: account.gender,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET,{
      expiresIn: "5m",
    });

    return token
  } catch (error) {

    return error
  }
};
