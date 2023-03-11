import express from "express"
import { addGoal, editGoal, getAllGoals, getEmployeeAndGoal } from "../controllers/goalController.js";
import { protect } from "../middleware/protect.js";
import restrictedTo from "../middleware/restrictedTo.js";

const goalRoute = express.Router()

// Add a new goal
goalRoute.post("/addgoal", protect, addGoal);

// Get all employeess and their current goals
goalRoute.get("/employeegoals", protect, restrictedTo("Admin", "HR Manager"), getEmployeeAndGoal);

// Get all goals for an employee
goalRoute.get("/goals", protect, getAllGoals)

// Edit the goals
goalRoute.put("/edit/:id", protect, editGoal)

export default goalRoute;
