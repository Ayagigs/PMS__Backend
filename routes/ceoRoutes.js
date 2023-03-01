import express from "express";
import { ceoLoginController, ceoRegisterationController, editCompanyDetailsController, getSpecificCeoDetailsController } from "../controller/ceoController.js";
import { isLogin } from "../middleware/isLogin.js";

const ceoRoute = express.Router();

// Ceo Registeration
ceoRoute.post("/registeration", ceoRegisterationController);

// Ceo Login
ceoRoute.post("/login", ceoLoginController);

//  Get logged in ceo details
ceoRoute.get("", isLogin, getSpecificCeoDetailsController);

//  Edit Company details
ceoRoute.put("", isLogin, editCompanyDetailsController);



export default ceoRoute