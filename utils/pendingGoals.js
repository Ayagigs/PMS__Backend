import Goal from "../model/GoalModel.js";
import asyncHandler from "express-async-handler";

export const getPendingGoals = asyncHandler(async (days, owner) => {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + days); // Calculate the deadline date

  const pendingGoals = await Goal.find({
    owner,
    enddate: {
      $gte: deadline, // deadline is greater than or equal to the calculated deadline date
      $lte: new Date(deadline.getTime() + 86400000), // deadline is less than or equal to the calculated deadline date plus 24 hours
    },
  });
  return pendingGoals;
});
