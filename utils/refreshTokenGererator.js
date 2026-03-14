import jwt from "jsonwebtoken";

export const createRefreshToken = (account) => {
  try {
    const payload = {
      sub: account.userId,
      gender: account.gender,
    };

    const token = jwt.sign(payload, process.env.JWT_REFRESH,{
      expiresIn: "7d",
    });

    return token;
  } catch (error) {
    return error;
  }
};
