import { Router } from "express";
import UserRegister from "../controllers/authControllers/registerProfile.js";
import jwtLogin from "../controllers/authControllers/login.js";
import chalk from "chalk";
import logout from "../controllers/authControllers/logout.js";
import { refreshToken } from "../controllers/authControllers/refreshToken.js";
import verifyOtp from "../controllers/authControllers/verifyOtp.js";
import resendOtp from "../controllers/authControllers/resendOtp.js";

const authRouter = Router()

authRouter.post('/register', (req, res) => {
    const response = UserRegister(req, res)
    return response
})

authRouter.post('/login', (req, res) => {
    const response = jwtLogin(req, res)
    return response
})

authRouter.post('/validate', (req, res) => {
    const response = verifyOtp(req, res)
    return response
})

authRouter.post('/resend-otp', (req, res) => {
    const response = resendOtp(req, res);
    return response;
})

authRouter.post('/logout', (req, res) => {
    console.log(chalk.blue("logout route activated"))
    const response = logout(req, res)
    return response
})

authRouter.post('/refreshToken', (req, res) => {
    const response = refreshToken(req, res)
    return response
})

export default authRouter