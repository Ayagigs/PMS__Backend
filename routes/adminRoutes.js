import express from "express";
import {
  adminLogin,
  adminReg,
  changePassword,
  deactivateEmployee,
  findAdminUser,
  forgotPassword,
  logout,
  profilePhotoUpload,
  resetPassword,
  updateCompanyDetails,
  updatePersonalInfo,
} from "../controllers/adminControllers.js";
import { contactUsMail } from "../controllers/contactusController.js";

import generateOTP from "../middleware/generateOtp.js";
import localVariables from "../middleware/localVariables.js";
import { protect } from "../middleware/protect.js";
import restrictedTo from "../middleware/restrictedTo.js";
import verifyOTP from "../middleware/verifyOtp.js";

const router = express.Router();

/************* Admin Routes ************/

router.post("/registeration", generateOTP, adminReg);
router.post("/login", adminLogin);
router.post("/logout", logout);
router.post("/forgotpassword", forgotPassword);
router.post("/photoupload", protect, restrictedTo('Admin'), profilePhotoUpload);
router.post("/contactus", contactUsMail)

/************* Put Request ************/
router.put("/resetpassword/:resetToken", resetPassword);

/************* Patch Request ************/
router.patch("/changepassword", protect, changePassword);
router.patch("/updatecompanydetails", protect, updateCompanyDetails);
router.patch("/updatepersonalinfo", protect, updatePersonalInfo);
router.patch("/deactivate/:employeeID", protect, restrictedTo("Admin"), deactivateEmployee);

/************* Get Request ************/
router.get("/findme", protect, findAdminUser);
router.get("/verifyotp", verifyOTP);
// router.get("/generateotp", localVariables, generateOTP);

export default router;
