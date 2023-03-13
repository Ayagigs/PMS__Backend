import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      default: "Admin",
    },
    companyName: { type: String, unique: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

AdminSchema.methods.generateToken = function () {
  const token = jwt.sign(
    { _id: this._id, role: this.role, companyName: this.companyName },
    process.env.JWT_KEY,
    {
      expiresIn: process.env.TOKEN_EXPIRES,
    }
  );

  return token;
};

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const Admin = mongoose.model("Admin", AdminSchema);

export default Admin;
