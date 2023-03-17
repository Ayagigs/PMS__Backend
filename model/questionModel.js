import mongoose from "mongoose";
import { EReviewType } from "../enums/EReviewType.js";

const questionSchema = new mongoose.Schema({
    questions: [
        {
            text: String,
            order: Number
        }
    ],
    options: [
        {
            text: String,
            value: Number
        }
    ],
    category: {
        type: String,
        enum: ["Review", "Competency"]
    },
    companyID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    },
    reviewType: {
        type: String,
        enum: EReviewType
    }
})

const Question = mongoose.model("Question", questionSchema)

export default Question