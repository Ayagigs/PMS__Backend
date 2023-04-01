import express from 'express'
import restrictedTo from '../middleware/restrictedTo.js'
import { protect } from '../middleware/protect.js'
import { addQuestion, deleteaQuestion, editQuestion, getAllQuestion, getCompetencyQuestion, updateOption } from '../controllers/questionController.js'

const questionRoute = express.Router()

questionRoute.post("/setquestion/:companyID", protect, restrictedTo('Admin', 'HR Manager'), addQuestion);
questionRoute.patch("/editquestion/:questionID", protect, restrictedTo("Admin", "HR Manager"), editQuestion);
questionRoute.patch("/setoptions/:companyID", protect, restrictedTo("Admin", "HR Manager"), updateOption);
questionRoute.delete("/delete/:questionID/:question", protect, restrictedTo("Admin", "HR Manager"), deleteaQuestion);
questionRoute.get('/getQuestions/:companyID/:reviewType/:category', protect, getAllQuestion)
questionRoute.get('/competencyQuestions/:companyID/:category', protect, getCompetencyQuestion)

export default questionRoute
