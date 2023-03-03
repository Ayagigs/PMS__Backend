import express from "express";
import {
  adminLogin,
  adminReg,
  forgotPassword,
  resetPassword,
  changePassword,
  updateCompanyDetails,
  updatePersonalInfo,
  logout,
} from "../adminSideModules/adminControllers.js";
import generateOTP from "../middleware/generateOtp.js";
import localVariables from "../middleware/localVariables.js";
import { protect } from "../middleware/protect.js";
import verifyOTP from "../middleware/verifyOtp.js";

const router = express.Router();

/************* Admin Routes ************/

router.post("/registeration", localVariables, generateOTP, adminReg);
router.post("/adminlogin", adminLogin);
router.post("/logout", logout);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);
router.patch("/changepassword", protect, changePassword);
router.patch("/updatecompanydetails", protect, updateCompanyDetails);
router.patch("/updatepersonalinfo", protect, updatePersonalInfo);
// router.get("/generateotp", localVariables, generateOTP);
router.get("/verifyotp", verifyOTP);
// Ceo Login
// adminRoute.post("/login", adminRegController);

// //  Get logged in ceo details
// adminRoute.get("", isLogin, getSpecificCeoDetailsController);

// //  Edit Company details
// adminRoute.put("", isLogin, editCompanyDetailsController);

export default router;
