
import { Router } from "express";
import { registerUser ,loginUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",       //goes through Middleware - Multer
            maxCount : 1           //images get stored in req.files not req.body
        },
        {
            name : "coverImage",
            maxCount : 1
        }]),
    registerUser)
router.route("/login").post(loginUser)

export default router;