import asyncHandler from "express-async-handler";
import errorHandler from "../utils/errorHandler.js";

const verifyOTP = asyncHandler(async (req, res, next) => {
  const { OTP } = req.body;

  if (parseInt(req.app.locals.OTP) === parseInt(OTP)) {
    req.app.locals.OTP = null;
    req.app.locals.resetSession = true;
  } else {
    return next(new errorHandler("Invalid OTP", 400));
  }

  next();
});

export default verifyOTP;
