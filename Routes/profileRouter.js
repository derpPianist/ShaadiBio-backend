import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { createProfile } from "../controllers/ProfileControllers/create.profile.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import chalk from "chalk";

const profilesRouter = Router()

profilesRouter.post('/create-profile', authMiddleware, upload.single("avatar"), async(req, res) => {

    if (!req.file) {
        return res.status(400).json({ message: "Avatar is required" });
    }

    const localPath = req.file.path;

    const cloudinaryResponse = await uploadOnCloudinary(localPath);

    const response = await createProfile(req, res, cloudinaryResponse.secure_url);

    return response;
})

profilesRouter.get('/test', authMiddleware, (req, res) => {
    console.log(chalk.green("Middleware test successful"));

    return res.status(200).json({
        message: "test middleware active"
    })
} ) 

export default profilesRouter
