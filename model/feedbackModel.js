import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    feedback: {
        type: String
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
    },
    review: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reviews"
    }
})

const Feedback = mongoose.model("Feedback", feedbackSchema)

export default Feedback