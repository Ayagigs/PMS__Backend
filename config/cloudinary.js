import {v2 as cloudinary} from "cloudinary";
import {CloudinaryStorage} from "multer-storage-cloudinary"
import dotenv from "dotenv";

dotenv.config();

// configure
cloudinary.config({
    cloud_name: "dvcpjoxks",
    api_key:  "839563865712681",
    api_secret:  "5NxpYs7NbVqnD8R5QpQ6BZ7VppA"
})

// CCREATE AN INSTANCCE OF CLOUDINARY STORAGE
export const profileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        allowedFormats: ["jpg", "png", "jpeg", "mov", "svg"],
        folder: "View",
        transformation: [{width:400, height: 400, crop: "limit"}],
    }
})