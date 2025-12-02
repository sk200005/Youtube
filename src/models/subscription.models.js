import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber : {
        type :mongoose.Schema.Types.ObjectId, 
        ref : "User"
    },
    channel : {
        type :mongoose.Schema.Types.ObjectId, //to whome the subscriber is subscribing 
        ref : "User"
    }

},{timestamps : true});

export const subscription = mongoose.model("subscription" , subscriptionSchema)