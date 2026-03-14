import express from "express";
import authRouter from "./authRouter.js";
import profilesRouter from "./profileRouter.js";

const router = express.Router()

router.get('/',(req, res) => {
    res.send('This is ShaadiBio Home page')
})

router.use('/auth', authRouter)
router.use('/profile', profilesRouter)


export default router