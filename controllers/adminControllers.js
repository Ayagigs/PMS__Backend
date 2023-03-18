import Admin from "../model/adminModel.js";
import validator from "validator";
// import generateToken from "../utils/generatetoken.js";
import errorHandler from "../utils/errorHandler.js";
import Token from "../model/tokenModel.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import crypto from "crypto";

import { emailSender } from "../utils/emailSender.js";
import Company from "../model/companyModel.js";
import Employee from "../model/EmployeeModel.js";

export const adminReg = asyncHandler(async (req, res, next) => {
  /************************* ADMIN PERSONAL INFORMATION ******************************/
  const { firstName, lastName, email, companyName, password, confirmPassword } =
    req.body;

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return next(new errorHandler("Please filled the form properly.", 422));
  }

  if (!validator.isEmail(email)) {
    return next(new errorHandler("Invalid Email", 422));
  }

  if (confirmPassword !== password) {
    // return res.status(422).json({ error: "Passwords Must Matched" });
    return next(new errorHandler("Passwords Must Matched.", 422));
  }

  const findAdminByEmail = await Admin.findOne({ email });

  if (findAdminByEmail) {
    return next(new errorHandler("User already exists with this email", 404));
  }


  const createAdmin = new Admin({
    firstName,
    lastName,
    email,
    password,
    companyName,
  });

  /************************* COMPANY INFORMATION ******************************/
  const {
    businessType,
    address,
    state,
    country,
    companyRegNo,
    companyPhone,
    numOfEmployees,
  } = req.body;

  if (!businessType || !companyName || !numOfEmployees || !companyRegNo) {
    return next(new errorHandler("Please filled the form properly.", 422));
  }

  const findCompanyByName = await Company.findOne({ companyName });

  if (findCompanyByName) {
    return next(
      new errorHandler("Company already exists with this Company name", 404)
    );
  }

  const findCompanyByRegNo = await Company.findOne({ companyRegNo });

  if (findCompanyByRegNo) {
    return next(
      new errorHandler(
        "Company already exists with this registeration number",
        404
      )
    );
  }

  // Save the admin
  const admin = await createAdmin.save();

  const createCompany = new Company({
    companyName,
    companyRegNo,
    businessType,
    companyPhone,
    address,
    state,
    country,
    numOfEmployees,
    companyID: admin._id,
  });

  const company = await createCompany.save();

  res.json({
    status: "Success",
    message: "Registeration Successfully",
    data: { admin, company },
  });
});

//Login Admin
export const adminLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!validator.isEmail(email)) {
    return next(new errorHandler("Invalid Email", 422));
  }

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return res
      .status(401)
      .json({ message: "No company with this email address" });
  }

  const pass = bcrypt.compareSync(password, admin.password);

  if (!pass) {
    return res.status(401).json({ message: "Incorrect credentials" });
  }

  const token = admin.generateToken();
  res.status(200).json({ data: admin, token });
});

//Logout Admin
export const logout = asyncHandler(async (req, res, next) => {});

// forgotpassword Password
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ email });

  if (!admin) {
    res.status(404).send({
      message: "User does not exist",
    });
  }

  // Delete token if exists in DB
  let token = await Token.findOne({ userId: admin._id });
  if (token) {
    await token.deleteOne();
  }

  // Reset Token
  let resetToken = crypto.randomBytes(32).toString("hex") + admin._id;

  // hash token before saving
  const haskedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Save Token to DB
  await new Token({
    userId: admin._id,
    token: haskedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000), // 30mins
  }).save();

  // construct URL
  const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${resetToken}`;

  // Reset Email
  const message = `
  <h2>Hello ${admin.firstName}</h2>
  <p>Please use the url below to rest your password</p>
  <p>
  This reset link is valid for only 30minutes
  </p>
  <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

  <p><Regards.../P>
  <p>Aya Team4</p>
  `;

  const subject = "Password Reset Request";
  const send_to = admin.email;
  const sent_from = process.env.EMAIL_USER;

  try {
    await emailSender(subject, message, send_to, sent_from);
    res.status(200).json({ success: true, message: "Reset Email Sent" });
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
});

// Change Password
export const changePassword = asyncHandler(async (req, res, next) => {
  const adminUser = await Admin.findById(req.userAuth);

  if (!adminUser) {
    return next(new errorHandler("User not found, Please signup", 404));
  }

  //Validate
  const { oldPassword, password } = req.body;
  if (!oldPassword || !password) {
    return next(new errorHandler("Please add old and new password", 400));
  }

  // check if old password matches password in DB
  const passwordCorrect = await bcrypt.compareSync(
    oldPassword,
    adminUser.password
  );

  if (adminUser && passwordCorrect) {
    adminUser.password = password;
    await adminUser.save();
    res.status(200).send("Password change successful");
  } else {
    return next(new errorHandler("Old password incorrect", 400));
  }
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  const { resetToken } = req.params;

  if (!password || !confirmPassword) {
    return next(new errorHandler("Please fill the form correctly", 404));
  }

  if (password !== confirmPassword) {
    return next(new errorHandler("passwords not matched", 400));
  }

  // hash token, then compare to the Token in DB
  const haskedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Find token in DB
  const adminToken = await Token.findOne({
    token: haskedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!adminToken) {
    return next(new errorHandler("Invalid or Expired Token", 404));
  }

  // Find user
  const adminUser = await Admin.findOne({ _id: adminToken.userId });
  adminUser.password = password;
  await adminUser.save();

  res.status(200).send({
    status: "success",
    message: "Password Reset Successful, Login to continue",
  });
});

export const updateCompanyDetails = asyncHandler(async (req, res, next) => {
  const company = await Company.findOne({ companyID: req.userAuth._id });
  console.log(company)
company.app
  if (company) {
    const {
      companyName,
      businessType,
      address,
      state,
      country,
      companyRegNo,
      numOfEmployees,
      midYearStartDate,
      midYearEndDate,
      fullYearStartDate,
      fullYearEndDate,
      appraisalStartDate,
      appraisalEndDate
    } = req.body;

    // validation for mid year end date should not be earlier than the start date
    if(midYearEndDate <= midYearStartDate){
      return next(new errorHandler("Mid-Year review end date can not be earlier than the start date", 500));
    }
    // validation for full year end date should not be earlier than the start date
    if(fullYearEndDate <= fullYearStartDate){
      return next(new errorHandler("Full-Year review end date can not be earlier than the start date", 500));
    }
    
    // validation for appraisal end date should not be earlier than the start date
    if(appraisalEndDate <= appraisalStartDate){
      return next(new errorHandler("360 appraisal review end date can not be earlier than the start date", 500));
    }
    
    // validation for full year and mid year should not be set in the same period
    if(fullYearStartDate >= midYearStartDate && fullYearStartDate < midYearEndDate){
      return next(new errorHandler("Full-Year and Mid-Year Reviews can not be taken in same time frame", 500));
    }
    if(midYearStartDate >= fullYearStartDate && midYearStartDate < fullYearEndDate){
      return next(new errorHandler("Full-Year and Mid-Year Reiews can not be taken in same time frame", 500));
    }

    
    const updateCompany = await Company.findOneAndUpdate(
      { companyID: req.userAuth._id },
      {
        $set: {
          companyName,
          companyRegNo,
          businessType,
          address,
          state,
          country,
          numOfEmployees,
          midYearStartDate,
          midYearEndDate,
          fullYearStartDate,
          fullYearEndDate,
          appraisalStartDate,
          appraisalEndDate
        },
      },
      {
        new: true,
      }
    );

    await Admin.findByIdAndUpdate(
      req.userAuth._id,
      {
        $set: {
          companyName,
        },
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      status: "Success",
      data: {updateCompany,}
    });
  } else {
    return next(new errorHandler("User not found, Please signup", 404));
  }
});

export const updatePersonalInfo = asyncHandler(async (req, res, next) => {
  const adminUser = await Admin.findById(req.userAuth);

  if (adminUser) {
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email) {
      return next(new errorHandler("Please filled the form properly", 422));
    }

    if (!validator.isEmail(email)) {
      return next(new errorHandler("Invalid Email", 422));
    }

    const updateInfo = await Admin.findByIdAndUpdate(
      req.userAuth,
      {
        $set: {
          firstName,
          lastName,
          email,
        },
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      status: "Success",
      data: updateInfo,
    });
  } else {
    return next(new errorHandler("User not found, Please signup", 404));
  }
});

export const findAdminUser = asyncHandler(async (req, res, next) => {
  const adminUser = await Admin.findById(req.userAuth);
  const company = await Company.find({companyName: adminUser.companyName})

  if (!adminUser) {
    return next(new errorHandler("No user Found, Please Login", 404));
  }
  res.status(200).json({
    status: "Success",
    data: {adminUser, company},
  });
});


export const deactivateEmployee = asyncHandler(async(req, res, next) => {
  const adminUser = await Admin.findById(req.userAuth);
  const {employeeID} = req.params;

  if (!adminUser) {
    return next(new errorHandler("No user Found, Please Login", 404));
  }

  if (!mongoose.Types.ObjectId.isValid(employeeID)) {
    return next(new errorHandler("Invalid objectID", 404));
  }

  const employee = await Employee.findByIdAndUpdate(employeeID, {
    $set: {
      status: Inactive
    }
  }, {
    new: true
  })

  res.status(200).json({
    status: "Success",
    data: employee,
  });
})


export const profilePhotoUpload = asyncHandler(async(req, res, next) => {

  try{
    // fint the user that wants to update profile
    const admin = await Admin.findById(req.userAuth._id);

    // check if the user exists
    if(!admin){
      return next(new errorHandler("No user Found, Please Login", 404));
    }

    if(req.file){
      await Admin.findByIdAndUpdate(req.userAuth._id, {
          $set:{
              profilePhoto: req.file.path
          },
      },{
          new: true
      })
    }
    res.status(200).send({status: 'Success', message: 'Profile Upload Successfull'})

    }catch(error){
        return res.status(500).send({status: 'Success', message: error.message})
    }
})



