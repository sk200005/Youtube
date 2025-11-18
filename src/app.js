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

app.use(cookieParser())               //Access cookies from the browser of the user

//////////////////MIDDLEWARE DECLARE///////////////

export {app}