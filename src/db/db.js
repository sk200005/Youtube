import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";

//////////////////Connection of DB/////////////////////

const connectDB = async()=>{
    try {
        const connectionInstance = await mongoose.connect        
        (`${process.env.DB_URI}`)         // Main Line

        console.log(`\nConnection Successful 💞\nDB HOST 𓀙  ${connectionInstance.connection.host}\n` )

            
    } catch (error) {
        console.log("Error: " ,error)
        process.exit(1)
    }
}

export default connectDB;