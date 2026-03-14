import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "ShaadiBio/profiles",
    });

    console.log("File successfully uploaded to cloudinary");
    console.log(response.secure_url);

    fs.unlinkSync(localFilePath);

    console.log("file removed from server");

    return response;
    
  } catch (error) {

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      return null
    }
  }
};
