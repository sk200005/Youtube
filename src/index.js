import mongoose from "mongoose";
import {DB_NAME}  from "./constants"
import DB_Connection from "./db";        //Connections Declartoin Importing

import dotenv from "dotenv"              
import { app } from "./app";             //I Think ! - Middleware File Importing

dotenv.config({path : './env'})          //tells to load variables form .env file


DB_Connection()            //DataBase Connection (inshort). // also returns promise 

.then(()=>{                // .then and .catch handles this promise
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`Server Running at port: ${process.env.PORT} or 8000`)
    })
    app.on("error" , (error) =>{
        console.log("error: " ,error);
        throw error
    });})
    
.catch((err) => {
    console.log("MongoDb connection falied..." ,err)
})