import express from "express";
import {
  addGoal,
  editGoal,
  findGoalById,
  getAllCompanyGoals,
  getAllGoals,
  getEmployeeAndGoal,
  sendGoalDeadlineNotification,
  updateNotifications,
} from "../controllers/goalController.js";
import { protect } from "../middleware/protect.js";
import restrictedTo from "../middleware/restrictedTo.js";

const goalRoute = express.Router();

// Add a new goal
goalRoute.post("/addgoal", protect, addGoal);
goalRoute.put("/notifications", protect, updateNotifications);
goalRoute.post("/notification", protect, sendGoalDeadlineNotification);

// Get all employeess and their current goals
goalRoute.get("/employeegoals/:companyID", protect, getEmployeeAndGoal);

// Get all goals for an employee
goalRoute.get("/goals", protect, getAllGoals);
goalRoute.get("/findgoal/:goalID", protect, findGoalById);
goalRoute.get("/companygoal/:companyID", protect, restrictedTo('Admin', 'HR Manager'), findGoalById);
goalRoute.get("/companygoals", protect, restrictedTo('Admin', 'HR Manager'), getAllCompanyGoals);

// Edit the goals
goalRoute.patch("/edit/:id", protect, editGoal);

export default goalRoute;
