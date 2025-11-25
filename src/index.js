import mongoose from "mongoose";
import connectDB from "./db/db.js";        //Connections Declartoin Importing

import dotenv from "dotenv"              
import { app } from "./app.js";             //I Think ! - Middleware File Importing

dotenv.config()          //tells to load variables form .env file


connectDB()            //MongoDB Driver Program (inshort) // also returns promise 

.then(()=>{                // .then and .catch handles this promise

    app.get("/" , (req ,res)=>{res.send("Namaskar 🙏")})
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`⚙️ Server Running at port ☞ ${process.env.PORT}`)
        
    })
    app.on("error" , (error) =>{
        console.log("error: " ,error);
        throw error
    });})
    
.catch((err) => {
    console.log("MongoDb connection falied..." ,err)
})