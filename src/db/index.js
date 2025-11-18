import mongoose from "mongoose";

import { DB_NAME } from "../constants";

//////////////////Connection of DB/////////////////////

const DB_Connection = async()=>{
    try {
        const connectionInstance = await mongoose.connect        
        (`${process.env.DB_URI}/${process.env.DB_NAME}`)         // Main Line

        console.log(`Connection Successful !!! with the DB HOST 
            : ${connectionInstance.connection.host}` )

            
    } catch (error) {
        console.log("Error: " ,error)
        process.exit(1)
    }
}

export default DB_Connection;