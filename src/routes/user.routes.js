
import { Router } from "express";
const router = Router();

import { registerUser } from "../controllers/user.controller.js";

router.route("/register").get(registerUser)
// router.route("/login").post(loginUser)

export default router;