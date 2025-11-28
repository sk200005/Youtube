import express from "express"
const app = express()
import cors from "cors" 
import cookieParser from "cookie-parser"

//////////////////IMPORTING///////////////////////

app.use(cors({
    origin:process.env.CORSE_ORIGIN,   //Corse middleWare
    credentials : true
}))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended:true, limit : "16kb"}))
app.use(express.static("public"));    // Store Video / images in the public folder
app.use(cookieParser())               //pulls cookies from the incoming HTTP request
                                      //parses them into a readable JavaScript object.
            

//////////////////MIDDLEWARE DECLARE///////////////

import userRouter from './routes/user.routes.js'   //because there is export default in user.route

/////////////////routes importing /////////////////

app.use("/api/v1/users" , userRouter)      // refere to all endpoints decalred 
                                           // inside user.route.js as userRouter


export {app}