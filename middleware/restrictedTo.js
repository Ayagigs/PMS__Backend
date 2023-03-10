import errorHandler from "../utils/errorHandler.js";

const restrictedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userAuth.role)) {
      return next(new errorHandler("Access denied", 403));
    }

    next();
  };
};

export default restrictedTo;
