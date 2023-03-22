const moment = require("moment");

function daysUntilGoalExpires(expiryDate) {
  const today = moment();
  const expiry = moment(expiryDate);
  return expiry.diff(today, "days");
}

export default daysUntilGoalExpires;
