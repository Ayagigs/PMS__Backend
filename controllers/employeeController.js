import Employee from "../model/EmployeeModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import asyncHandler from "express-async-handler";
import errorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";
import crypto from "crypto";
import hatchedToken from "../utils/resetToken.js";
import { emailSender } from "../utils/emailSender.js";
import Company from "../model/companyModel.js";
import csv from "csvtojson";
import Reviews from "../model/reviewModel.js";
import { EReviewType } from "../enums/EReviewType.js";
import { EReviewTime } from "../enums/EReviewTime.js";
import Notification from "../model/notificationSchema.js";

export const employeeReg = asyncHandler(async (req, res, next) => {
  const {
    employeeID,
    firstName,
    lastName,
    workEmail,
    phoneNo,
    department,
    gender,
    role,
  } = req.body;

  if (
    !employeeID ||
    !firstName ||
    !lastName ||
    !workEmail ||
    !phoneNo ||
    !department ||
    !gender ||
    !role
  ) {
    return next(new errorHandler("Please filled the form properly.", 422));
  }

  if (!validator.isEmail(workEmail)) {
    return next(new errorHandler("Invalid Work Email", 422));
  }

  // Find the company with the given companyRegNo, companyName
  const { companyID } = req.params;

  const company = await Company.findOne({ companyID });

  if (!company) {
    return next(new errorHandler("Company not Found", 404));
  } else {
    const findEmployeeID = await Employee.findOne({
      employeeID,
      companyID,
    });

    if (findEmployeeID) {
      return next(
        new errorHandler("User already exists with this employeeID", 404)
      );
    }

    if (!mongoose.Types.ObjectId.isValid(companyID)) {
      return next(new errorHandler("Invalid objectID", 404));
    }

    const resetToken = await crypto.randomBytes(32).toString("hex");

    const hatchPasswordToken = hatchedToken(resetToken);

    const employee = await Employee.create({
      employeeID,
      firstName,
      lastName,
      workEmail,
      phoneNo,
      department,
      gender,
      role,
      registeredBy: req.userAuth.role,
      resetPasswordToken: hatchPasswordToken,
      resetTokencreatedAt: Date.now(),
      resetTokenExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7days in milli
      companyID,
    });
    console.log(req.userAuth);

    // res.status(200).json({ status: "Success", data: employee });
    const invitationLink = `${"https://develop--viewpms.netlify.app"}/resetPassword/${resetToken}`;

    // Reset Email
    const message = `

    <div
        style="
          width: 658px;
          border-radius: 0px;
          padding: 48px;
          background: #f1f3f4;
        "
      >
        <h2>Hey ${employee.firstName},</h2>
        <p>
        ${req.userAuth.companyName} has invited you to join the team as ${employee.role}. Accept the invitation to start creating awesome things
          together.
        </p>
        <p>This invite only lasts for 7 days.</p>

        <p
          style="
            padding: 19px 32px;
            text-decoration: none;
            color: white;

            width: 211px;
            background: rgba(62, 69, 235, 1);
          "
        >
          <a
            href="${invitationLink}"
            clicktracking="off"
            style="
              font-family: 'Satoshi';
              font-style: normal;
              font-weight: 700;
              font-size: 16px;
              line-height: 140%;
              display: flex;
              align-items: center;
              text-align: center;
              color: #ffffff;
              text-decoration: none;
              justify-content: center;
            "
            >Accept Invitation</a
          >
        </p>

        <p><Regards.../P></p>
        <p>Aya Team4</p>
      </div>
    `;

    const subject = "Invitation";
    const send_to = employee.workEmail;
    const sent_from = process.env.EMAIL_USER;

    try {
      await emailSender(subject, message, send_to, sent_from);
      const token = employee.generateToken();
      res.status(200).json({
        success: true,
        data: employee,
        message: "Reset Email Sent",
        token,
      });
    } catch (error) {
      res.status(500).send({ status: "Fail", message: error.message });
    }
  }
});

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
  const employee = await Employee.findOne({
    resetPasswordToken: haskedToken,
    resetTokenExpiresAt: { $gt: Date.now() },
  });

  if (employee) {
    employee.password = password;
    employee.status = "Active";
    await employee.save();

    res.status(200).send({
      status: "success",
      message: "Password Reset Successful, Login to continue",
    });
  } else {
    return next(new errorHandler("Invalid or Expired Token", 404));
  }
});

export const employeeLogin = asyncHandler(async (req, res, next) => {
  const { employeeID, password } = req.body;
  if (!employeeID || !password) {
    return next(new errorHandler("Please filled the form properly", 422));
  }

  const employee = await Employee.findOne({ employeeID });

  if (!employee) {
    return next(new errorHandler(`Employee with ${employeeID} not found`, 404));
  }

  if (employee.status !== "Active") {
    return next(new errorHandler("Please activate your account", 404));
  }

  const pass = bcrypt.compareSync(password, employee.password);

  if (!pass) {
    return next(new errorHandler("Incorrect Password", 401));
  }

  const token = employee.generateToken();
  res.status(200).json({ data: employee, token });
});

export const getAllEmployees = asyncHandler(async (req, res, next) => {
  const employees = await Employee.find({
    companyID: req.params.companyID,
  }).populate("reviews");

  if (employees) {
    res.json({
      status: "Success",
      data: employees,
    });
  } else {
    return next(new errorHandler("Employees not found", 422));
  }
});

export const registerBulkEmployee = async (req, res) => {
  try {
    const { companyID } = req.params;
    const company = await Company.findOne({ companyID });

    if (!company) {
      return next(new errorHandler("Company not Found", 404));
    }

    csv()
      .fromFile(req.file.path)
      .then(async (jsonObj) => {
        var empcount = 0;
        for (let i = 0; i < jsonObj.length; i++) {
          const employeeExist = await Employee.find({
            companyID,
            employeeID: jsonObj[i]["Employee Id"],
          });

          if (employeeExist.length !== 0) {
            continue;
          }

          const resetToken = await crypto.randomBytes(32).toString("hex");

          const hatchPasswordToken = hatchedToken(resetToken);

          const employee = await Employee.create({
            employeeID: jsonObj[i]["Employee Id"],
            firstName: jsonObj[i]["First Name"],
            lastName: jsonObj[i]["Last Name"],
            workEmail: jsonObj[i]["Email"],
            phoneNo: jsonObj[i]["Phone Number"],
            department: jsonObj[i]["Department"],
            gender: jsonObj[i]["Gender"],
            role: jsonObj[i]["Role"],
            jobtitle: jsonObj[i]["Job Title"],
            companyID,
            status: "Inactive",
            registeredBy: req.userAuth.role,
            resetPasswordToken: hatchPasswordToken,
            resetTokencreatedAt: Date.now(),
            resetTokenExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7days in milli
          });

          console.log(employee);
          empcount++;

          const invitationLink = `${process.env.CLIENT_URL}/resetPassword/${resetToken}`;

          // Reset Email
          const message = `

          <div
              style="
                width: 658px;
                border-radius: 0px;
                padding: 48px;
                background: #f1f3f4;
              "
            >
              <h2>Hey ${employee.firstName},</h2>
              <p>
              ${req.userAuth.companyName} has invited you to join the team as ${employee.role}. Accept the invitation to start creating awesome things
                together.
              </p>
              <p>This invite only lasts for 7 days.</p>

              <p
                style="
                  padding: 19px 32px;
                  text-decoration: none;
                  color: white;

                  width: 211px;
                  background: rgba(62, 69, 235, 1);
                "
              >
                <a
                  href="${invitationLink}"
                  clicktracking="off"
                  style="
                    font-family: 'Satoshi';
                    font-style: normal;
                    font-weight: 700;
                    font-size: 16px;
                    line-height: 140%;
                    display: flex;
                    align-items: center;
                    text-align: center;
                    color: #ffffff;
                    text-decoration: none;
                    justify-content: center;
                  "
                  >Accept Invitation</a
                >
              </p>

              <p><Regards.../P></p>
              <p>Aya Team4</p>
            </div>
          `;

          const subject = "Invitation";
          const send_to = employee.workEmail;
          const sent_from = process.env.EMAIL_USER;

          try {
            await emailSender(subject, message, send_to, sent_from);
            const token = employee.generateToken();
          } catch (error) {
            res.status(500).send({ status: "Fail", message: error.message });
          }
        }
        res.status(200).send({
          status: "success",
          message: `${empcount} Employees added Successfully`,
        });
      });
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
};

export const getSpecificEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.userAuth._id);

    if (employee) {
      res.status(200).json({
        data: employee,
      });
    } else {
      return next(new errorHandler("Invalid or Expired Token", 404));
    }
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
};

export const editEmployeeDetails = async (req, res) => {
  const {
    firstName,
    lastName,
    middleName,
    preferredName,
    jobTitle,
    employmentStatus,
    workEmail,
    phoneNo,
    workNo,
    homeNo,
    address,
    state,
    country,
    gender,
    maritalStatus,
    DOB,
  } = req.body;

  try {
    const employee = await Employee.findByIdAndUpdate(
      req.userAuth._id,
      {
        $set: {
          firstName,
          lastName,
          middleName,
          preferredName,
          jobTitle,
          employmentStatus,
          workEmail,
          phoneNo,
          workNo,
          homeNo,
          address,
          state,
          country,
          gender,
          maritalStatus,
          DOB,
        },
      },
      {
        new: true,
      }
    );

    res.status(200).send({ status: "Success", data: employee });
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
};

export const profilePhotoUpload = asyncHandler(async (req, res, next) => {
  try {
    // fint the user that wants to update profile
    const employee = await Employee.findById(req.userAuth._id);

    // check if the user exists
    if (!employee) {
      return next(new errorHandler("No user Found, Please Login", 404));
    }

    if (req.file) {
      await Employee.findByIdAndUpdate(
        req.userAuth._id,
        {
          $set: {
            profilePhoto: req.file.path,
          },
        },
        {
          new: true,
        }
      );
    }
    res
      .status(200)
      .send({ status: "Success", data: { profilePhoto: req.file.path } });
  } catch (error) {
    return res.status(500).send({ status: "Success", message: error.message });
  }
});

export const getEmployeeInDepartment = async (req, res) => {
  try {
    const employee = await Employee.findById(req.userAuth._id);
    const colleagues = await Employee.find({
      department: employee.department,
      role: "Staff",
      companyID: employee.companyID,
      id: { $ne: req.userAuth._id },
    });

    res.status(200).send({ status: "Success", data: colleagues });
  } catch (error) {
    return res.status(500).send({ status: "Success", message: error.message });
  }
};

export const searchEmployee = async (req, res) => {
  const { searchParams } = req.body;

  try {
    const employees = await Employee.find({
      $or: [
        { firstName: { $regex: searchParams, $options: "i" } },
        { lastName: { $regex: searchParams, $options: "i" } },
      ],
      companyID: req.userAuth._id,
    });

    res.status(200).send({ status: "Success", data: employees });
  } catch (error) {
    return res.status(500).send({ status: "Success", message: error.message });
  }
};

export const changePassword = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.userAuth._id);

  if (!employee) {
    return next(new errorHandler("User not found, Please signup", 404));
  }

  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new errorHandler("Please complete all fields", 400));
  }

  if (confirmPassword !== newPassword) {
    // return res.status(422).json({ error: "Passwords Must Matched" });
    return next(
      new errorHandler("Current Password and new Password must match.", 422)
    );
  }

  // check if old password matches password in DB
  const passwordCorrect = await bcrypt.compareSync(
    currentPassword,
    employee.password
  );

  if (employee && passwordCorrect) {
    employee.password = newPassword;
    await employee.save();
    res.status(200).send("Password change successful");
  } else {
    return next(new errorHandler("Current Password incorrect", 400));
  }
});

export const updateNotificationPreferences = asyncHandler(
  async (req, res, next) => {
    const updateFields = req.body;
    const playerID = req.params;

    const employee = await Employee.findById(req.userAuth._id);

    if (!employee) {
      return next(new errorHandler("User not found, Please signup", 404));
    }

    try {
      let notification = await Notification.findOne({
        employeeID: req.userAuth._id,
      });

      if (!notification) {
        // Create new notification document if it doesn't exist
        notification = new Notification({
          employeeID: req.userAuth._id,
          oneSignalId: playerID,
          ...updateFields,
        });

        await notification.save();
      } else {
        // Update existing notification document
        notification.set(updateFields);
        notification.updatedAt = Date.now();
        await notification.save();
      }

      res.status(200).json({ success: true, notification, playerID });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        success: false,
        error: "Failed to create or update notifications",
      });
    }
  }
);
