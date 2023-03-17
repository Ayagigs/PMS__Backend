import express from 'express';
import { add360Appraisal, addFeedback, addGoalReview, addPerformanceReview, employeesFor360Appraisal, employeesForGoalReview, employeesForPerformanceReview, getAllReviews, getMyReviews } from '../controllers/reviewController.js';
import canReviewGoal from '../middleware/canReviewGoal.js';
import isAppraisalTime from '../middleware/isAppraisalTime.js';
import isReviewTime from '../middleware/isReviewTime.js';
import { protect } from '../middleware/protect.js';
import restrictedTo from '../middleware/restrictedTo.js';

const reviewRoute = express.Router()

reviewRoute.post("/performancereview/:employeeID", protect, restrictedTo("HR Manager", "Performance Manager", "Admin"), isReviewTime, addPerformanceReview)
reviewRoute.post("/appraisal/:employeeID", protect, isAppraisalTime, add360Appraisal)
reviewRoute.post("/goalreview/:goalID", protect, canReviewGoal, addGoalReview)
reviewRoute.post("/feedback/:reviewID", protect, addFeedback)
reviewRoute.get("/performanceReview", protect, restrictedTo("HR Manager","Performance Manager", "Admnin"), isReviewTime, employeesForPerformanceReview)
reviewRoute.get("/appraisal", protect, isAppraisalTime, employeesFor360Appraisal)
reviewRoute.get("/goalReview", protect, employeesForGoalReview)
reviewRoute.get("/allreviews", protect, restrictedTo("HR Manager","Performance Manager", "Admin"),  getAllReviews)
reviewRoute.get("/myreviews", protect, getMyReviews)



export default reviewRoute