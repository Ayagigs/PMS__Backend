const localVariables = (req, res, next) => {
  req.app.locals = {
    OTP: null,
    resetSession: false,
    userData: req.body,
    userEmail: req.body.email,
    userFirstName: req.body.firstName,
   
  };

  next();
};
export default localVariables;
