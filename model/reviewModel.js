import mongoose from "mongoose";
import { EReviewTime } from "../enums/EReviewTime.js";
import { EReviewType } from "../enums/EReviewType.js";
import { ERatings } from "../enums/ERatings.js";

const reviewSchema = new mongoose.Schema({
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
    reviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
    },
    reviewType: {
        type: String,
        enum: EReviewType
    },
    reviewTime: {
        type: String,
        enum: EReviewTime
    },
    feedback: {
        type: String
    },
    score: {
        type: Number,
        required: [true, "Score is needed"]
    },
    competency: {
        type: Number,
        required: [true, "Competency Score is needed"]
    },
    goal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Goal"
    },
    date: {
        type: Date,
        default: Date.now()
    },
    ratings: {
        type: String,
        enum: ERatings
    },
    finalScore: {
        type: Number,
        required: [true, "Final Score is needed"]
    }
})

const Reviews = mongoose.model("Reviews", reviewSchema)

export default Reviews