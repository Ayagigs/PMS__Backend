import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
    goaltitle: {
        type: String,
        required: [true, "Goal title is required"]
    },
    startdate: {
        type: Date
    },
    enddate: {
        type: Date
    },
    category: {
        type: String,
        required: [true, "Category is required"]
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    },
    keyobjectives: [
        {
            type: String
        }
    ],
    status: {
        type: String,
        enum: ["In Progress", "Completed", "Overdue"],
        default: "In Progress"
    },
    feedbacks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Feedbacks"
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
    },
    isCompleted: {
        type: Boolean,
        default: "false"
    }
})

const Goal = mongoose.model("Goal", goalSchema)

export default Goal