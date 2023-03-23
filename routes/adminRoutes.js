import express from "express";
import {
  adminLogin,
  adminReg,
  changePassword,
  createAdminAccount,
  deactivateEmployee,
  findAdminUser,
  forgotPassword,
  googleLogin,
  logout,
  profilePhotoUpload,
  resetPassword,
  updateCompanyDetails,
  updatePersonalInfo,
} from "../controllers/adminControllers.js";
import { contactUsMail } from "../controllers/contactusController.js";

import generateOTP from "../middleware/generateOTP.js";
import localVariables from "../middleware/localVariables.js";
import { protect } from "../middleware/protect.js";
import restrictedTo from "../middleware/restrictedTo.js";
import verifyOTP from "../middleware/verifyOTP.js";
import multer from "multer";
import { profileStorage } from "../config/cloudinary.js";

const router = express.Router();

const profileupload = multer({ storage: profileStorage });

/************* Admin Routes ************/

router.post("/registeration", adminReg, localVariables, generateOTP);
router.post("/login", adminLogin);
router.post("/googlelogin", googleLogin);
router.post("/logout", logout);
router.post("/forgotpassword", forgotPassword);
router.post("/contactus", contactUsMail);
router.post("/verifyotp", verifyOTP, createAdminAccount);
router.post(
  "/photoupload",
  protect,
  restrictedTo("Admin"),
  profileupload.single("profile"),
  profilePhotoUpload
);

/************* Put Request ************/
router.put("/resetpassword/:resetToken", resetPassword);

/************* Patch Request ************/
router.patch("/changepassword", protect, changePassword);
router.patch("/updatecompanydetails", protect, updateCompanyDetails);
router.patch("/updatepersonalinfo", protect, updatePersonalInfo);
router.patch(
  "/deactivate/:employeeID",
  protect,
  restrictedTo("Admin"),
  deactivateEmployee
);

/************* Get Request ************/
router.get("/findme", protect, findAdminUser);

router.post("/generateotp", localVariables, generateOTP);

export default router;
