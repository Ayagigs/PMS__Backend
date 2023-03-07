import express from "express";
import {
  employeeLogin,
  employeeReg,
  resetPassword,
} from "../controllers/employeeController.js";
import { protect } from "../middleware/protect.js";
import multer from "multer";

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

employeeRoute.post("/registeration", protect, employeeReg);
employeeRoute.post("/login", employeeLogin);
employeeRoute.post("/resetpassword", resetPassword);

// Get all company employees
// employeeRoute.get("", isLogin, getAllEmployeeController);

// //  Find employee by id
// employeeRoute.get("/byid/:id", getSpecificEmployeeDetailsController);

// // Get logged in employee details
// employeeRoute.get("/specific", isLogin, getLoggedinEmployeeDetailsController);

// // Add employees using csv files
// employeeRoute.post(
//   "/csvupload",
//   upload.single("file"),
//   isLogin,
//   registeringBulkEmployeeController
// );

// // Employee setting up their password after rreceiving mail
// employeeRoute.put("/activation/:employeeid", passwordSetUpController);

export default employeeRoute;
