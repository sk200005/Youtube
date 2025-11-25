import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/User.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req,res) =>{
    //Get username,email,fullname,avatar,coverimage,password
    //check if feilds are not empty
    //check is the user already present before
    //get images - i.e avatar and coverimage is not empty 
    //check if avatar and coverimage(optional) are not empty 
    //upload them to cloudinary , get the url 2]particularly check is avatar is uploaded
    //create object the given data (required for mongoDB) 2] create entry call in DB
    //Remove password and refreshToken from object
    //Check is user created ?
    //return result
    const { fullName, email, username ,password } = req.body;
    if([username,email,fullName,password].some((feild)=> feild?.trim()===""))//if some/ any of the feild, 
    { throw new ApiError(400 , "All Feilds Required ⚠️") }  //even after trimming are empty, throw error
                                                            
    const existingUser = User.findOne({ $or : [{ username } , { email }] })
    if(existingUser) throw new ApiError(409 , "User Already Registered 🥲")

    const avatarPath = req.files?.avatar[0]?.path;
    const coverImagePath = req.files?.coverImage[0]?.path;

    if(!avatarPath) {throw new ApiError(400 , "Avatar File Required 😊");}

    const avatar = await uploadOnCloudinary(avatarPath);
    const coverimg = await uploadOnCloudinary(coverImagePath);

    if(!avatar) {throw new ApiError(400 , "Avatar File Required 😊");}

    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverimg?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken ")
    if(!createdUser) throw new ApiError(500 , "Something went wrong while Registering")

return res.status(201).json(new ApiResponse(200 , createdUser , "User Registered Successfully"))
})


export {registerUser}