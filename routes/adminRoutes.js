import express from "express";
import {
  adminLogin,
  adminReg,
  changePassword,
  findAdminUser,
  forgotPassword,
  logout,
  resetPassword,
  updateCompanyDetails,
  updatePersonalInfo,
} from "../controllers/adminControllers.js";

import generateOTP from "../middleware/generateOtp.js";
import localVariables from "../middleware/localVariables.js";
import { protect } from "../middleware/protect.js";
import verifyOTP from "../middleware/verifyOtp.js";

const router = express.Router();

/************* Admin Routes ************/

router.post("/registeration", adminReg);
router.post("/login", adminLogin);
router.post("/logout", logout);
router.post("/forgotpassword", forgotPassword);

/************* Put Request ************/
router.put("/resetpassword/:resetToken", resetPassword);

/************* Patch Request ************/
router.patch("/changepassword", protect, changePassword);
router.patch("/updatecompanydetails", protect, updateCompanyDetails);
router.patch("/updatepersonalinfo", protect, updatePersonalInfo);

/************* Get Request ************/
router.get("/findme", protect, findAdminUser);
router.get("/verifyotp", verifyOTP);
// router.get("/generateotp", localVariables, generateOTP);

export default router;
