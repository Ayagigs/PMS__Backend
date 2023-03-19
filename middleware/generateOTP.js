import otpGenerator from "otp-generator";
import asyncHandler from "express-async-handler";
import validator from "validator";
import errorHandler from "../utils/errorHandler.js";
import { emailSender } from "../utils/emailSender.js";

const generateOTP = asyncHandler(async (req, res, next) => {
  req.app.locals.OTP = await otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const { firstName, email } = req.body;

  if (!validator.isEmail(email)) {
    return next(new errorHandler("Invalid Email", 422));
  }

  // Reset Email
  const message = `
    <h2>Hello ${firstName}, </h2>
    <p>Please use this one time OTP ${req.app.locals.OTP} to register</p>

    <p><Regards.../P>
    <p>Aya Team4</p>
    `;

  const subject = "OTP to Login";
  const send_to = email;
  const sent_from = process.env.EMAIL_USER;

  try {
    await emailSender(subject, message, send_to, sent_from);
    res.status(200).json({
      success: true,
      message: "Check your email for OTP",
      OTP: req.app.locals.OTP,
    });
    next();
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }

  // res
  //   .status(201)
  //   .send({ Message: "Check your email for OTP", OTP: req.app.locals.OTP });

});

export default generateOTP;
