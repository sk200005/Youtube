import {asyncHandler} from "../utils/asyncHandler.js"

const registerUser = asyncHandler(async (req,res) =>{
    res.send("Registering..")
    res.status(200).json({
        message : "ok"
    })
     
})

export {registerUser}