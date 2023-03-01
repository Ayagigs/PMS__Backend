import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    employeeid: {
        type: String,
        required: [true, "Employee Id is required"]
    },
    firstname: {
        type: String,
        required: [true, "First Name is required"]
    },
    middlename: {
        type: String
    },
    lastname: {
        type: String,
        required: [true, "Last Name is required"]
    },
    preferredname: {
        type: String
    },
    role: {
        type:String,
        enum:["HR Manager", "Performance Manager", "Staff"]
    },
    password: {
        type: String
    },
    dob: {
        type: Date
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Others"]
    },
    maritalstatus: {
        type: String,
        enum: ["Single", "Married", "Divorced"]
    },
    email: {
        type: String,
        required: [true, "Email is required"]
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"]
    },
    profilephoto: {
        type: String
    },
    department: {
        type: String,
        required: [true, "Department is required"]
    },
    reportsto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
    },
    jobtitle: {
        type: String
    },
    address: {
        type: String
    },
    state: {
        type: String
    },
    country: {
        type: String
    },
    companyregno: {
        type: String,
        required: [true, "Company Reg No is required"]
    },
    employmentstatus: {
        type: String,
        enum: ["Full Time", "Part Time", "Contract", "Intern"]
    },
    terminationdate: {
        type: Date
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Inactive"
    }
},
{
    timestamps: true,
    toJSON: {virtuals: true}
})

const Employee = mongoose.model("Employee", employeeSchema)

export default Employee;