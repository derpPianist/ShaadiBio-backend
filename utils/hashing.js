import bcrypt from "bcryptjs";


export const hashedText = async (password) => {
  const hashedStr = await bcrypt.hash(
    password,
    parseInt(process.env.SALT_ROUNDS),
  );

  return hashedStr;
};
