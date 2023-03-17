import express from 'express'
import restrictedTo from '../middleware/restrictedTo.js'
import { protect } from '../middleware/protect.js'
import { addQuestion, deleteaQuestion, editQuestion, getAllQuestion } from '../controllers/questionController.js'

const questionRoute = express.Router()

questionRoute.post("/setquestion", protect, restrictedTo('Admin', 'HR Manager'), addQuestion);
questionRoute.patch("/editquestion/:questionID", protect, restrictedTo("Admin", "HR Manager"), editQuestion);
questionRoute.delete("/delete/:questionID/:question", protect, restrictedTo("Admin", "HR Manager"), deleteaQuestion);
questionRoute.get('/getQuestions/:companyID/:reviewType/:category', protect, getAllQuestion)

export default questionRoute
