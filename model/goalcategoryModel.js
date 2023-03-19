import mongoose from "mongoose";

const goalcategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: [true, "Goal category name is required"]
    },
    department: {
        type: String,
        required: [true, 'Department is Required']
    },
    companyID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    }
},{
    timestamps: true,
    toJSON: { virtuals: true },
})

const GoalCategory = mongoose.model('GoalCategory', goalcategorySchema);

export default GoalCategory