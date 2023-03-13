import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const employeeSchema = new mongoose.Schema(
  {
    employeeID: {
      type: String,
      required: [true, "Employee Id is required"],
    },
    firstName: {
      type: String,
      required: [true, "First Name is required"],
    },
    middleName: {
      type: String,
    },
    lastName: {
      type: String,
      required: [true, "Last Name is required"],
    },
    preferredName: {
      type: String,
    },
    role: {
      type: String,
      enum: ["HR Manager", "Performance Manager", "Staff"],
    },
    password: {
      type: String,
    },
    DOB: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
    },
    maritalStatus: {
      type: String,
      enum: ["Single", "Married", "Divorced"],
    },
    workEmail: {
      type: String,
      required: [true, "Email is required"],
    },
    phoneNo: {
      type: String,
      required: [true, "Phone number is required"],
    },
    profilePhoto: {
      type: String,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
    },
    reportSto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    jobTitle: {
      type: String,
    },
    address: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    employmentStatus: {
      type: String,
      enum: ["Full Time", "Part Time", "Contract", "Intern"],
    },
    terminationDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive",
    },
    resetPasswordToken: {
      type: String,
    },
    resetTokencreatedAt: {
      type: Date,
    },
    resetTokenExpiresAt: {
      type: Date,
    },
    registeredBy: {
      type: String,
      required: true,
    },
    goals : [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Goal"
      }
    ],
    companyID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

employeeSchema.methods.generateToken = function () {
  const token = jwt.sign(
    { _id: this._id, role: this.role },
    process.env.JWT_KEY,
    {
      expiresIn: process.env.TOKEN_EXPIRES,
    }
  );

  return token;
};

employeeSchema.index({ employeeID: 1, companyID: 1 }, { unique: true });
const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
