import errorHandler from "../utils/errorHandler.js";

exports.restrictedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userAuth.role)) {
      return next(new errorHandler("Access denied", 403));
    }

    next();
  };
};
