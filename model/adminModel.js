import mongoose from "mongoose";
import bcrypt from "bcrypt";

const AdminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is required"],
    },
    lastName: {
      type: String,
      required: [true, "Last Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unigue: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      default: "Admin",
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      unigue: true,
    },
    businessType: {
      type: String,
      required: [true, "Business type is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
    },
    companyRegNo: {
      type: String,
      required: [true, "Company Reg No is required"],
      unique: true,
    },
    companyEmail: {
      type: String,
      unigue: true,
    },
    emailOrCompanyName: {
      type: String,
      unigue: true,
    },
    companyPhone: {
      type: String,
    },
    numOfEmployees: {
      type: String,
      enum: ["0-10", "10-50", "50-100", "100 and above"],
      required: [true, "Number of employees is required"],
    },
    // employees: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "Employee"
    //     }
    // ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const Admin = mongoose.model("Admin", AdminSchema);

export default Admin;
