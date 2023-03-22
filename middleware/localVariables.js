const localVariables = (req, res, next) => {
  req.app.locals = {
    OTP: null,
    resetSession: false,
    userData: req.body,
  };

  next();
};
export default localVariables;
