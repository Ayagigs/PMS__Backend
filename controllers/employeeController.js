import Admin from "../model/adminModel.js";
import Employee from "../model/EmployeeModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import generateToken from "../utils/generatetoken.js";
import asyncHandler from "express-async-handler";
import errorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";
import crypto from "crypto";
import hatchedToken from "../utils/resetToken.js";
import { emailSender } from "../utils/emailSender.js";

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

  const { companyRegNo, companyName, _id } = await Admin.findById(
    req.userAuth
  ).select("companyRegNo companyName _id");

  // Find the company with the given companyRegNo, companyName
  const company = await Admin.findOne({
    $or: [{ companyRegNo }, { companyName }],
  });

  if (!company) {
    return next(new errorHandler("Company not Found", 404));
  } else {
    const findEmployeeID = await Employee.findOne({
      employeeID,
      companyID: _id,
    });

    if (findEmployeeID && companyRegNo) {
      return next(
        new errorHandler("User already exists with this employeeID", 404)
      );
    }

    if (!mongoose.Types.ObjectId.isValid(_id)) {
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
      resetPasswordToken: hatchPasswordToken,
      resetTokencreatedAt: Date.now(),
      resetTokenExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7days in milli
      companyID: _id,
    });

    res.status(200).json({ status: "Success", data: employee });
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
        ${companyName} has invited you to join the team as ${employee.role}. Accept the invitation to start creating awesome things
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
      const token = generateToken(employee._id, employee.role);
      res
        .status(200)
        .json({ success: true, message: "Reset Email Sent", token });
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

  const pass = bcrypt.compareSync(password, admin.password);

  if (!pass) {
    return next(new errorHandler("Incorrect Password", 401));
  }

  const token = generateToken(employee._id, employee.role);
  res.status(200).json({ data: employee, token });
});

// export const resetPassword = async (req, res) => {
//   const { password, confirmPassword } = req.body;
//   const { employeeID } = req.params;

//   try {
//     const employee = await Employee.findOne({ employeeid });

//     if (employee.status !== "Inactive") {
//       return res.json({
//         status: "Success",
//         message: "Account has already been activated",
//       });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const passwordhash = await bcrypt.hash(password, salt);

//     await Employee.findOneAndUpdate(
//       { employeeid },
//       {
//         $set: {
//           password: passwordhash,
//           status: "Active",
//         },
//       },
//       {
//         new: true,
//       }
//     );

//     res.json({
//       status: "Success",
//       message: "Account Setup Successfull",
//     });
//   } catch (error) {
//     res.json(error.message);
//   }
// };

// export const getAllEmployee = asyncHandler( async (req, res, next) => {
//   try {
//     const companyFound = await Admin.findById(req.userAuth);
//     const employeeFound = await Employee.findById(req.userAuth);
//     const allemployees = await Employee.find({
//       companyregno: !companyFound
//         ? employeeFound.companyregno
//         : companyFound.companyregno,
//     });

//     res.json({
//       status: "Success",
//       data: allemployees,
//     });
//   } catch (error) {
//     res.json(error.message);
//   }
// });

// export const registeringBulkEmployeeController = async (req, res) => {
//   try {
//     const employeefound = await Employee.findById(req.userAuth);
//     const companyFound = await Admin.findById(req.userAuth);

//     csv()
//       .fromFile(req.file.path)
//       .then(async (jsonObj) => {
//         var empcount = 0;
//         for (let i = 0; i < jsonObj.length; i++) {
//           const employees = await Employee.find({
//             companyregno: !companyFound
//               ? employeefound.companyregno
//               : companyFound.companyregno,
//           });

//           const employeeidFound = employees.find(
//             (element) => element.employeeid === jsonObj[i]["Employee Id"]
//           );

//           const employeeFound = employees.find(
//             (element) => element.email === jsonObj[i]["Email"]
//           );

//           if (employeeFound) {
//             continue;
//           } else if (employeeidFound) {
//             continue;
//           }

//           await Employee.create({
//             employeeid: jsonObj[i]["Employee Id"],
//             firstname: jsonObj[i]["First Name"],
//             lastname: jsonObj[i]["Last Name"],
//             email: jsonObj[i]["Email"],
//             phone: jsonObj[i]["Phone Number"],
//             department: jsonObj[i]["Department"],
//             gender: jsonObj[i]["Gender"],
//             role: jsonObj[i]["Role"],
//             jobtitle: jsonObj[i]["Job Title"],
//             companyregno: companyFound.companyregno,
//             status: "Inactive",
//           });

//           empcount++;
//         }
//         res.json({
//           status: "Success",
//           message: `${empcount} Employees added Successfully`,
//         });
//       });
//   } catch (error) {
//     res.json(error.message);
//   }
// };

// export const getLoggedinEmployeeDetailsController = async (req, res) => {
//   try {
//     const employeeFound = await Employee.findById(req.userAuth);

//     if (employeeFound) {
//       res.json({
//         status: "Success",
//         data: { employeeFound },
//       });
//     } else {
//       res.json({
//         status: "Success",
//         message: "Please Login",
//       });
//     }
//   } catch (error) {
//     res.json(error.message);
//   }
// };

// export const getSpecificEmployeeDetailsController = async (req, res) => {
//   try {
//     const employeeFound = await Employee.findById(req.params.id);

//     if (employeeFound) {
//       res.json({
//         status: "Success",
//         data: { employeeFound },
//       });
//     } else {
//       res.json({
//         status: "Success",
//         message: "Please Login",
//       });
//     }
//   } catch (error) {
//     res.json(error.message);
//   }
// };
