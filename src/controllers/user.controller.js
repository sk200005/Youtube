import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

import path from "path";
import { fileURLToPath } from "url";
import { url } from "inspector";
import { json } from "stream/consumers";
import { subscribe } from "diagnostics_channel";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/////////////////////Token Generation Funcion/- Debbuged///////////////////////////////////////

const generateAccessAndRefreshTokens = async(userID)=>{
    try {
        const user1 = await User.findById(userID);
        
        const accessToken = user1.generateAccessToken();
        const refreshToken = user1.generateRefreshToken();

        user1.refreshToken = refreshToken;
        await user1.save({validateBeforeSave : false})

        return{accessToken , refreshToken}

    } catch (error) {
        throw new ApiError(500 , "Something went wrong while generating " +
                                 "Access and Refresh Tokens ")}
}
/////////////////////Register User- Debbuged///////////////////////////////////////////////////
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
////////////////////////////LogIn User- Debbuged//////////////////////////////////////////////
const loginUser = asyncHandler(async(req ,res) =>{
    //Get Login Details - Username , email 
    //check the same from database
    //password check
    //Tokens related - Check Tokens , Deduct them , refresh them
    //send cookie

    const {email, username, password} = req.body
    const normalizedUsername = username?.toLowerCase();

    if(!username && !email) {throw new ApiError(400 , "Either of Email or Username required 😁");}

    const checkUser = await User.findOne({
        $or : [{username : normalizedUsername} , {email}]  
    })
    if(!checkUser) {throw new ApiError(404, "User Does not Exist 😭 Register now")}

    const isPasswordvalid = await checkUser.isPasswordCorrect(password);
    if(!isPasswordvalid) {throw new ApiError(401, "Password Incorrect 😭")}

    const{accessToken ,refreshToken}  = await generateAccessAndRefreshTokens(checkUser._id);
                                 ///////////Cookie/////////////

    const loggedInUser = await User.findById(checkUser._id).select("-password -refreshToken") //optional

    const options = {
        httpOnly : true,  //Cookie is not accessible by JavaScript on the client side.
        secure: false       //When true, cookie is sent only over HTTPS.
    }
    return res
    .status(200)     
    .cookie("accessToken" , accessToken , options)  //adds a Set-Cookie header into the response. 
    .cookie("refreshToken" , refreshToken , options) //Browser receives it and stores the cookie automatically in it's own cookie jar, isolated by domain.
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

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : "" // this removes the field from document
            }
        },
        { new : true}
    )
    const options = {
        httpOnly : true,  //Cookie is not accessible by JavaScript on the client side.
        secure: false       //When true, cookie is sent only over HTTPS.
    }
    return res
    .status(200)
    .clearCookie("accessToken" ,options)
    .clearCookie("refreshToken" ,options)
    .json(new ApiResponse(200 ,{},"User Logged Out"))
})
///////////////////////RefreshAccessToken- Debbuged///////////////////////////////////////////////
const RefreshAccessToken = asyncHandler(async(req,res) =>{
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingToken) {
    throw new ApiError(401, "Refresh token missing");
}

    try {
        const decodeToken = jwt.verify(incomingToken ,process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodeToken._id);
        if (!user) {throw new ApiError(401 , "Invalid Refresh Token");}
    
        if(incomingToken !== user?.refreshToken) {throw new ApiError(401 , "Refreshed Token Expired")}
     
        const options = {
                httpOnly: true,
                secure: true
            }
            
        const{accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200, 
                    {accessToken, refreshToken},
                    "Access token refreshed"))
    } catch (error) {
        throw new ApiError (401 , error?.message || "Something Went Wrong")
    }
})
////////////////////////////////Change CUrrent Password - Debbuged/////////////////////////////////
const changeCurrentPassword = asyncHandler(async(req, res)=>{
    const {oldPassword ,newPassword } = req.body;

    const user = await User.findById(req.user._id);    //id through request(auth middleware)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    
    if (!isPasswordCorrect) { throw new ApiError(400 , "Invalid Passsword")}

    user.password = newPassword;
    await user.save({validateBeforeSave : false});

    return res
    .status(200)
    .json(new ApiResponse(200 , {} , "Password Changed Successsfully"))
})
////////////////////////////////Get Current User - Debugged ///////////////////////////////////////
 const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200)
    .json( new ApiResponse(200 , req.user ,"Current User fetched Successfully")) //id through request(auth middleware)
 })
/////////////////////////////////updateAccountDetail - Debugged ///////////////////////////////////
const updateAccountDetail = asyncHandler(async(req,res)=>{
    const {fullName , email} = req.body;
    if(!fullName || !email) {throw new ApiError(400, "All feilds are Required") }

    User.findByIdAndUpdate(req.user?._id,{//id through request(auth middleware)
        $set : {fullName : fullName ,
                email : email,
        }
    },{new : true}).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200 , req.user , "Updated SUcessfully !"))
})
 ////////////////////////////////updateUserAvatar -Debbuged////////////////////////////////////////
const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if(!avatarLocalPath) {throw new ApiError(400 , "Avatar file is Missing")}

    const uploadAvatar = await uploadOnCloudinary(avatarLocalPath);

    if(!uploadAvatar.url) {throw new ApiError(400 , "Error while uploading Avatar on Cloudinary")}
     
    const updateAvatar = await User.findByIdAndUpdate(
        req.user._id, //id through request(auth middleware)
        {$set : {avatar : uploadAvatar.url}},
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200 ,{} ,"Uplaoded Avatar Successfully"))
})
////////////////////////////////updateUserCoverImage - Debugged/////////////////////////////////////
const updateUserCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    if(!coverImageLocalPath) {throw new ApiError(400 , "CoverImage file is Missing")}

    const uploadcoverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!uploadcoverImage.url) {throw new ApiError(400 , "Error while uploading coverImage on Cloudinary")}
     
    const updatecoverImage = await User.findByIdAndUpdate(
        req.user._id,  //id through request(auth middleware)
        {$set : {coverImage : uploadcoverImage.url}},
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200 ,{} ,"Uplaoded CoverImage Successfully"))
})
////////////////////////////////getUserChannelProfile - /////////////////////////////////////////////
const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {u1} = req.params
    if (!u1?.trim) { throw new ApiError(400 , "UserName is Missing")}

    const channel = await User.aggregate([  //  Finding/Counting the subscribers subscribed to  u1
        {
            $match : {username : u1?.toLowerCase()}   //search around u1
        },
        {                  //left Join -    u1 (USER) :|: u1 as channel (SUBSCRIPTION)
            $lookup : {
                from:"subscriptions",     //find in subscription table
                localField : "_id",       // u1  - in USER table   (on basis of _id)
                foreignField :"channel",  // u1  - in SUBSCRIPTION (on basis where u1 as channel)
                as : "totalSubscibers"         //when don't care who is subscribed to u1
            }              //we just count, how many times u1 has appered as channel
        },
        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "subscriber",
                as : "subscibedTo"
            }
        },
        {
            $addFields : {
                subscriberCount : {
                    $size : "$totalSubscibers"
                },
                channelSubscribedToCount : {
                    $size :  "$subscibedTo"
                },
                isSubscribed: {
                    $cond:{
                        if : {$in : [req.user?._id , "$totalSubscibers.subscriber"]},
                        then : true,
                        else : false
                    }
                }
            }
        },
        {
            $project : {
                fullName : 1,
                username : 1,
                subscriberCount : 1,
                channelSubscribedToCount : 1,
                avatar : 1,
                coverImage : 1,
                email : 1
            }
        }
    ])
    if (!channel?.length) {throw new ApiError(404 , "Channel does not exists");}

    return res.status(200)
    .json(
        new ApiResponse(200, channel[0] , "User channel fetched successfully")
    )
})
////////////////////////////////getUserWatchHistory - /////////////////////////////////////////////
const getUserWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([{
        $match : {
            _id : new mongoose.Types.ObjectId(req.user._id) // way to convert sting --> id (actual)
            //req.user._id has a string init, which is converted to id by mongoose but not in aggregation pipeline 
        },
    },
    {
        $lookup : {
            from : "videos",
            localField : "watchedHistory",
            foreignField : "_id",
            as : "watchHistory",
            pipeline : [{
                $lookup : {
                    from: "users" ,
                    localField : "owner",
                    foreignField : "_id",
                    as : "Owner",
                    pipeline :[{
                        $project :{
                            fullName : 1,
                            username : 1,
                            avatar : 1
                        }
                    },
                    {
                        $addFields : {
                            owner: {
                                $first : "$owner"
                            }
                        }
                    }
                ]
                }
            }]
        }
    }
  ])
  return res.status(200)
  .json(new ApiResponse(200 , user[0].watchHistory , "Watched History Fetched Successfully"))
})
///////////////////////////////////////////////////////////////////////////////////////////////////
export { registerUser,
        loginUser,
        logoutUser,
        RefreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        updateAccountDetail,
        updateUserAvatar,
        updateUserCoverImage,
        getUserChannelProfile,
        getUserWatchHistory
};
