import express from 'express';
import restrictedTo from '../middleware/restrictedTo.js';
import { protect } from '../middleware/protect.js';
import { addCategory, deleteCategory, editCategory, getGoalCategories } from '../controllers/goalcategoryController.js';

const categoryRoute = express.Router()

categoryRoute.post("/addcategory", protect, restrictedTo('Performance Manager'), addCategory);
categoryRoute.patch("/editCategory/:categoryID", protect, restrictedTo('Performance Manager'), editCategory)
categoryRoute.get("/getCategories", protect, getGoalCategories)
categoryRoute.delete("deletecategory/:categoryID", protect, restrictedTo('Performance Manager'), deleteCategory)

export default categoryRoute