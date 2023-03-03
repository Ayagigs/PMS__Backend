import Admin from "../model/adminModel.js";
import validator from "validator";
import generateToken from "../utils/generatetoken.js";
import errorHandler from "../utils/errorHandler.js";
import Token from "../model/tokenModel.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import crypto from "crypto";

import { emailSender } from "../utils/emailSender.js";

export const adminReg = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    companyName,
    businessType,
    address,
    state,
    country,
    companyRegNo,
    numOfEmployees,
    role,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !confirmPassword ||
    !businessType ||
    !companyName ||
    !numOfEmployees ||
    !companyRegNo
  ) {
    return next(new errorHandler("Please filled the form properly.", 422));
  }

  if (!validator.isEmail(email)) {
    return next(new errorHandler("Invalid Email", 422));
  }

  if (confirmPassword !== password) {
    // return res.status(422).json({ error: "Passwords Must Matched" });
    return next(new errorHandler("Passwords Must Matched.", 422));
  }

  const findAdminByRegNo = await Admin.findOne({ companyRegNo });

  if (findAdminByRegNo) {
    return next(new errorHandler("Admin already exists with this regNo", 404));
  }
  const findAdminByEmail = await Admin.findOne({ email });

  if (findAdminByEmail) {
    return next(new errorHandler("Admin already exists with this email", 404));
  }

  const admin = await Admin.create({
    firstName,
    lastName,
    email,
    password,
    companyName,
    companyRegNo,
    businessType,
    address,
    state,
    country,
    numOfEmployees,
    role,
  });

  const token = generateToken(admin._id);

  //   res.cookie("token", token, {
  //     path: "/",
  //     httpOnly: true,
  //     expires: new Date(Date.now() + 1000 * 86400),
  //     sameSite: "none",
  //     secure: true,
  //   });

  res.json({
    status: "Success",
    token,
    data: {
      admin,
    },
  });
});

//Login Admin
export const adminLogin = asyncHandler(async (req, res, next) => {
  const { emailOrCompanyName, password } = req.body;

  const admin = await Admin.findOne({
    $or: [{ email: emailOrCompanyName }, { companyName: emailOrCompanyName }],
  });

  if (!admin) {
    return res
      .status(401)
      .json({ message: "No company with this email or company name" });
  }

  const pass = bcrypt.compareSync(password, admin.password);

  if (!pass) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  const token = generateToken(admin._id);
  res.status(200).json({ admin, token });
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
  const { password } = req.body;
  const { resetToken } = req.params;

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
  const adminUser = await Admin.findById(req.userAuth);

  if (adminUser) {
    const {
      companyName,
      businessType,
      address,
      state,
      country,
      companyRegNo,
      numOfEmployees,
    } = req.body;

    const updateCompany = await Admin.findByIdAndUpdate(
      req.userAuth,
      {
        $set: {
          companyName,
          companyRegNo,
          businessType,
          address,
          state,
          country,
          numOfEmployees,
        },
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      status: "Success",
      data: updateCompany,
    });
  } else {
    return next(new errorHandler("User not found, Please signup", 404));
  }
});

export const updatePersonalInfo = asyncHandler(async (req, res, next) => {
  const adminUser = await Admin.findById(req.userAuth);

  if (adminUser) {
    const { firstName, lastName, role, companyEmail } = req.body;

    if (!firstName || !lastName || !role || !companyEmail) {
      return next(new errorHandler("Please filled the form properly", 422));
    }

    if (!validator.isEmail(companyEmail)) {
      return next(new errorHandler("Invalid Email", 422));
    }

    const updateInfo = await Admin.findByIdAndUpdate(
      req.userAuth,
      {
        $set: {
          firstName,
          lastName,
          role,
          companyEmail,
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

export const getSpecificCeoDetailsController = async (req, res) => {
  try {
    const companyFound = await Ceo.findById(req.userAuth);

    if (companyFound) {
      res.json({
        status: "Success",
        data: { companyFound },
      });
    } else {
      res.json({
        status: "Success",
        message: "Please Login",
      });
    }
  } catch (error) {
    res.json(error.message);
  }
};
