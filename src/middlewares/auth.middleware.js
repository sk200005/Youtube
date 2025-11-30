
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken" 
import { User } from "../models/User.models.js";
import dotenv from "dotenv"      
dotenv.config({path : './.env'})
import { ApiError } from "../utils/ApiError.js";

//Browser automatically attaches cookies
//It’s automatic. The frontend code does not attach these manually.
//Thus we are verifying these cookies again sent by the browser

export const verfyJWT = asyncHandler(async(req,_,next)=>{
    try {
        const token = req.cookies ?.accessToken || req.header("Athorization") ?.replace("Bearer " , "")
        //In header format of request, Token Stores in the format -> " Authorization : bearer <token> "
    
        if (!token) { throw new ApiError(401, "Unauthorized request")}
    
        const decodeToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET); 
        // decodeToken Has ._id of that user

        const user = await User.findById(decodeToken?._id).select("-password -refreshToken");
    
        if (!user) {throw new ApiError(401 , "Invalid Access Token")}
    
        req.user = user;
        next()  // after req moves out of auth middleware by "next()" command ,
                //  it is attached with the user's every data 
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid Access Token")
    }
})
//this middleware just attaches req.user to the incoming request related
//  to the cookies sent by the browser earlier 