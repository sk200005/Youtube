//Handles File Uploads
//Reads files sent through HTML forms or API requests.
//Saves them to:
//Local folder (e.g., /uploads) or
//Memory (for further processing or cloud upload).

import multer from "multer";

const storage = multer.diskStorage({          //Store the uploaded files on my computer’s disk (local storage)

    destination: function (req, file, cb) {
      cb(null, "./public/temp")             //All uploaded files will be stored here temporarily.
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)         //Keeps the same name as uploaded by the user.
    }
  })
  
export const upload = multer({ storage, }) // Creates an upload handler using the storage configuration

//now fill can be saved using following code which uses "upload".single....

//app.post("/upload", upload.single("avatar"), (req, res) => {
//    res.send("File uploaded!");
//});
