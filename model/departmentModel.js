import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    departmentName: {
        type: String,
        required: [true, 'Department Name is Required']
    },
    companyID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
})

const Department = mongoose.model('Department', departmentSchema);

export default Department