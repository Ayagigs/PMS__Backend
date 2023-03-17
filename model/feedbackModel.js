import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    feedback: {
        type: String
    },
    employeeName: {
        type: String,
    },
    employeeProfile: {
        type: String 
    },
    employeeRole: {
        type: String
    }
})

const Feedback = mongoose.model("Feedback", feedbackSchema)

export default Feedback