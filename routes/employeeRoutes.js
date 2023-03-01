import express from "express";
import { employeeLoginController, employeeRegisterationController, getAllEmployeeController, getLoggedinEmployeeDetailsController, getSpecificEmployeeDetailsController, passwordSetUpController, registeringBulkEmployeeController } from "../controller/employeeController.js";
import { isLogin } from "../middleware/isLogin.js";
import multer from "multer";
import { createGoalController } from "../controller/goalController.js";

var storage = multer.diskStorage({  
    destination:(req,file,cb)=>{  
    cb(null,'./');  
    },  
    filename:(req,file,cb)=>{  
    cb(null,file.originalname);  
    }
}); 

const employeeRoute = express.Router();
const upload = multer({storage})

// CEO registering an staff/Manager
employeeRoute.post("/registeration", isLogin, employeeRegisterationController);

// Employee/Manager login
employeeRoute.post("/login", employeeLoginController);

// Get all company employees
employeeRoute.get("", isLogin, getAllEmployeeController);

//  Find employee by id
employeeRoute.get("/byid/:id", getSpecificEmployeeDetailsController);

// Get logged in employee details
employeeRoute.get("/specific", isLogin, getLoggedinEmployeeDetailsController);

// Add employees using csv files
employeeRoute.post("/csvupload", upload.single("file"), isLogin, registeringBulkEmployeeController);


// Employee setting up their password after rreceiving mail
employeeRoute.put("/activation/:employeeid", passwordSetUpController);



export default employeeRoute