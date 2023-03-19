import express from "express";
import {
  editEmployeeDetails,
  employeeLogin,
  employeeReg,
  getAllEmployees,
  getSpecificEmployee,
  profilePhotoUpload,
  registerBulkEmployee,
  resetPassword,
} from "../controllers/employeeController.js";
import { protect } from "../middleware/protect.js";
import multer from "multer";
import { profileStorage } from "../config/cloudinary.js";
import restrictedTo from "../middleware/restrictedTo.js";
import generateOTP from "../middleware/generateOTP.js"
import { v2 as cloudinary } from "cloudinary";
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const employeeRoute = express.Router();
const upload = multer({storage});

const profileupload = multer({storage: profileStorage})
// ************************ POST REQUEST ************************
employeeRoute.post(
  "/registeration/:companyID",
  protect,
  restrictedTo("Admin", "HR Manager"),
  employeeReg
);
employeeRoute.post("/login", employeeLogin);
employeeRoute.post("/resetpassword/:resetToken", resetPassword);
employeeRoute.post("/profile",protect, profileupload.single('profile'), profilePhotoUpload)

// Add employees using csv files
employeeRoute.post(
  "/csvupload/:companyID",
  upload.single("file"),
  protect,
  restrictedTo("Admin", "HR Manager"),
  registerBulkEmployee,
  generateOTP
  );
  
// ****************************** PATCH REQUEST ***************************
employeeRoute.patch("/editdetails", protect, editEmployeeDetails)

// ******************************** GET REQUEST **************************
employeeRoute.get("/employees/:companyID", protect, getAllEmployees);
employeeRoute.get("/findme", protect, getSpecificEmployee);


export default employeeRoute;
