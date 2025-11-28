import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrpt from "bcrypt"

const userSchema = new mongoose.Schema(
    {
      username : {
        type : String,
        required : true,
        unique : true , 
        lowercase : true,
        trim : true,
        index : true
      },
      email : {
        type : String,
        required : true,
        unique : true , 
        lowercase : true,
        trim : true
      },
      fullName : {
        type : String,
        required : true,
        trim : true,
        index : true
      },
      avatar : {
        type : String, //cloudinary url
        required : true,
      },
      coverImage : {
        type : String, //cloudinary url
      },
      password: {
        type :String,
        required : [true , "Password Required !!!"]
      },
      watchedHistory : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Video"
      },
      refreshToken: {
            type: String
      }
    },
    {
        timestamps : true
    });

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrpt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrpt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(          //Creates the token payload  
        {                     //Packages key user details inside the token
            _id: this._id,    //backend can later verify without hitting the database.
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET, //prevents from forging access tokens

        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY /* 1 Day */}
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(           //A refresh token is a long-lived token that allows            
        { _id: this._id, },   //the user to get a new access token without logging in again.

        process.env.REFRESH_TOKEN_SECRET,

        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
}

export const  User = mongoose.model("User" , userSchema )


