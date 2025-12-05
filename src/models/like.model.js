import mongoose, { mongo } from "mongoose";

const likeSchema = new mongoose.Schema(
    {
        video : { 
            type : mongoose.Schema.Types.ObjectId,
            ref : "Video"
        },
        comment : {
            type:mongoose.Schema.Types.ObjectId,
            ref : "Comment"
        },
        likedBy : {
            types : mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        tweet : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Tweet"
        }
    },
    {timestamps : true}
)

export const Like = mongoose.model("Like" ,likeSchema )