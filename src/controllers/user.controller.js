import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import path from "path";
import { fileURLToPath } from "url";
import { url } from "inspector";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/////////////////////Token Generation Funcion////////////////////////////////////////

const generateAccessAndRefreshTokens = async(userID)=>{
    try {
        const user1 = await User.findById({userID});
        
        const accessToken = user1.generateAccessToken();
        const refreshToken = user1.generateRefreshToken();

        user1.refreshToken = refreshToken;
        user1.save({validateBeforeSave : false})

        return{accessToken , refreshToken}

    } catch (error) {
        throw new ApiError(500 , "Something went wrong while generating " +
                                 "Access and Refresh Tokens ")}
}
/////////////////////Register User///////////////////////////////////////////////////
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
////////////////////////////LogIn User//////////////////////////////////////////////
const loginUser = asyncHandler(async(req ,res) =>{
    //Get Login Details - Username , email 
    //check the same from database
    //password check
    //Tokens related - Check Tokens , Deduct them , refresh them
    //send cookie

    const {email , username , password} = req.body

    if(!username || !email) {throw new ApiError(400 , "Either of Email or Username required 😁");}

    const checkUser = await User.findOne({
        $or : [{username} , {email}]  
    })
    if(!checkUser) {throw new ApiError(404, "User Does not Exist 😭 Register now")}

    const isPasswordvalid = await checkUser.isPasswordCorrect(password);
    if(!isPasswordvalid) {throw new ApiError(401, "Password Incorrect 😭")}

    const{accessToken ,refreshToken}  = await generateAccessAndRefreshTokens(checkUser._id);
                                 ///////////Cookie/////////////

    const loggedInUser = User.findById(user._id).select("-password -refreshToken") //optional

    const options = {
        httpOnly : true,  //Cookie is not accessible by JavaScript on the client side.
        secure: url       //When true, cookie is sent only over HTTPS.
    }
    return res
    .status(200)     
    .cookie("AcceessToken" , accessToken , options)  //adds a Set-Cookie header into the response. 
    .cookie("RefreshToken" , refreshToken , options) //Browser receives it and stores the cookie automatically in it's own cookie jar, isolated by domain.
    .json(                                           
        new ApiResponse(
            200,
            {                  
               user : loggedInUser ,      // The logged-in user’s data
               accessToken ,refreshToken  // The same tokens (for frontend optional use)
            },
            "User logged in Successfully"
        )
    )
});
/////////////////////////////////////LogOut User ///////////////////////////////////////



export { registerUser ,loginUser};
