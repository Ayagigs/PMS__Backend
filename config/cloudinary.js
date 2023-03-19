import {v2 as cloudinary} from "cloudinary";
import {CloudinaryStorage} from "multer-storage-cloudinary"
import dotenv from "dotenv";

dotenv.config();

// configure
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// CCREATE AN INSTANCCE OF CLOUDIARY STORAGE
export const profileStorage = new CloudinaryStorage({
    cloudinary,
    allowedFormats: ["jpg", "png", "mov", "svg"],
    params: {
        folder: "forum-api",
        transformation: [{width:400, height: 400, crop: "limit"}]
    }
})