import bcrypt from "bcryptjs";

export const comparePassword = async(plainTextPassword, HashedPasssword) => {

    console.log("Compare password hit!")
    return await bcrypt.compare(plainTextPassword, HashedPasssword)
}