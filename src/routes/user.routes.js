
import { Router } from "express";
import { registerUser,
    loginUser,
    logoutUser ,
    RefreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetail,
    updateUserAvatar,
    updateUserCoverImage

} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verfyJWT } from "../middlewares/auth.middleware.js";

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

//Secured Routes
router.route("/logout").post(verfyJWT , logoutUser)
router.route("/refresh-token").post(RefreshAccessToken)
router.route("/change-password").post(verfyJWT , changeCurrentPassword)
router.route("/get-currentUser").post(verfyJWT , getCurrentUser)
router.route("/update-accountDetail").post(verfyJWT , updateAccountDetail)
router.route("/update-avatarImage").post(verfyJWT , updateUserAvatar)
router.route("/update-coverImage").post(verfyJWT , updateUserCoverImage )


export default router;