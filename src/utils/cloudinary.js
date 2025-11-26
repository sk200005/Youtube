import dotenv from "dotenv"      
dotenv.config({path : './.env'})
      // Don't Forget !!!

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Load Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  try {
    // Execute upload
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });

    // Clean up temp file
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (cleanupErr) {
        console.warn("Temp file cleanup issue:", cleanupErr);
      }
    }

    return response;

  } catch (err) {
    console.error("Cloudinary upload error:", err);

    // Clean up temp file on failure
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch { /* silent */ }
    }

    return null;
  }
};

export { uploadOnCloudinary };
