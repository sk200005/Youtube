//Handles File Uploads
//Reads files sent through HTML forms or API requests.
//Saves them to:
//Local folder (e.g., /uploads) or
//Memory (for further processing or cloud upload).

import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
})