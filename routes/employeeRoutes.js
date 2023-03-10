import express from "express";
import {
  employeeLogin,
  employeeReg,
  getAllEmployees,
  getSpecificEmployee,
  registerBulkEmployee,
  resetPassword,
} from "../controllers/employeeController.js";
import { protect } from "../middleware/protect.js";

import multer from "multer";
import restrictedTo from "../middleware/restrictedTo.js";

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const employeeRoute = express.Router();
const upload = multer({ storage });

employeeRoute.post(
  "/registeration/:companyID",
  protect,
  restrictedTo("Admin", "HR Manager"),
  employeeReg
);

employeeRoute.get("/employees", protect, getAllEmployees);
employeeRoute.get("/findme", protect, getSpecificEmployee);
employeeRoute.post("/login", employeeLogin);
employeeRoute.post("/resetpassword/:resetToken", resetPassword);

// Add employees using csv files
employeeRoute.post(
  "/csvupload",
  upload.single("file"),
  protect,
  registerBulkEmployee
);

export default employeeRoute;
