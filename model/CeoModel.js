import mongoose from "mongoose";

const ceoSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "First Name is required"]
    },
    lastname: {
        type: String,
        required: [true, "Last Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    role: {
        type: String,
        default: "CEO"
    },
    companyname: {
        type: String,
        required: [true, "Company name is required"]
    },
    businesstype: {
        type: String,
        required: [true, "Business type is required"]
    },
    address: {
        type: String,
        required: [true, "Address is required"]
    },
    state: {
        type: String,
        required: [true, "State is required"]
    },
    country: {
        type: String,
        required: [true, "Country is required"]
    },
    companyregno: {
        type: String,
        required: [true, "Company Reg No is required"]
    },
    companyemail: {
        type: String,
    },
    companyphone: {
        type: String,
    },
    numofemployees: {
        type: String,
        enum: ["0-10", "10-50", "50-100", "100 and above"],
        required: [true, "Number of employees is required"]
    },
    employees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee"
        }
    ]
},
{
    timestamps: true,
    toJSON: {virtuals: true}
})

const Ceo = mongoose.model("Ceo", ceoSchema)

export default Ceo