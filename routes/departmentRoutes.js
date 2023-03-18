import express from 'express';
import restrictedTo from '../middleware/restrictedTo.js';
import { protect } from '../middleware/protect.js';
import { addDepartment, deleteDepartment, editDepartment, getDepartments } from '../controllers/departmentController.js';

const departmentRoute = express.Router()

departmentRoute.post("/add", protect, restrictedTo('Admin'), addDepartment)
departmentRoute.patch("/editdepartment/:departmentID", protect, restrictedTo('Admin'), editDepartment)
departmentRoute.get("/getdepartments/:companyID", protect, getDepartments)
departmentRoute.delete("/deletedepartment/:departmentID", protect, restrictedTo('Admin'), deleteDepartment)


export default departmentRoute