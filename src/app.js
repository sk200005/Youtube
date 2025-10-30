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

app.use(cookieParser())

//////////////////MIDDLEWARE DECLARE///////////////

export {app}