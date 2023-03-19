import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, "Company name is required"],
    unique: true,
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
  companyPhone: {
    type: String,
  },
  numOfEmployees: {
    type: String,
    enum: ["0-10", "10-50", "50-100", "100 and above"],
    required: [true, "Number of employees is required"],
  },
  companyID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  midYearStartDate: {
    type: Date
  },
  midYearEndDate: {
    type: Date
  },
  fullYearStartDate: {
    type: Date
  },
  fullYearEndDate: {
    type: Date
  },
  appraisalStartDate: {
    type: Date
  },
  appraisalEndDate: {
    type: Date
  }
});

const Company = mongoose.model("Company", companySchema);

export default Company;
