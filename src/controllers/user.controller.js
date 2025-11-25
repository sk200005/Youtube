import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    // Basic payload check
    if ([fullName, email, username, password].some(field => !field || field.trim() === "")) {
        throw new ApiError(400, "All Fields Required ⚠️");
    }

    // Check existing user
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (existingUser) {
        throw new ApiError(409, "User Already Registered 🥲");
    }

    // Multer file paths
    const avatarFile = req.files?.avatar?.[0];
    const coverFile  = req.files?.coverImage?.[0];

    if (!avatarFile) {
        throw new ApiError(400, "Avatar File Required 😊");
    }

    // Absolute paths for Cloudinary upload
    const avatarPath = path.resolve(avatarFile.path);
    const coverPath  = coverFile ? path.resolve(coverFile.path) : null;



    // Upload to Cloudinary
    const avatarUpload = await uploadOnCloudinary(avatarPath);
    const coverUpload  = coverPath ? await uploadOnCloudinary(coverPath) : null;

    if (!avatarUpload) {
        throw new ApiError(500, "Avatar File Upload Failed..");
    }

    // Create new user
    const newUser = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        avatar: avatarUpload.secure_url || avatarUpload.url,
        coverImage: coverUpload?.secure_url || coverUpload?.url || ""
    });

    const sanitizedUser = await User.findById(newUser._id).select(
        "-password -refreshToken"
    );

    if (!sanitizedUser) {
        throw new ApiError(500, "Something went wrong while Registering");
    }

    return res.status(201).json(
        new ApiResponse(200,  sanitizedUser,"User Registered Successfully")
    );
});

export { registerUser };
