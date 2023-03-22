// import asyncHandler from "express-async-handler";
// import { getEmployees } from "../controllers/goalController.js";
// import { getPendingGoals } from "./pendingGoals.js";
// import { CronJob } from "cron";
// import { MongoClient } from "mongodb";
// const uri =
//   "mongodb+srv://TraineeProject:6yBKlovmJt8YJu5y@cluster0.rtdurd7.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// // export const sendEmailNotificationsz = asyncHandler(async (employeeId) => {
// //   console.log(employeeId);
// //   const twoDaysGoals = await getPendingGoals(2, employeeId);
// //   const oneDayGoals = await getPendingGoals(1, employeeId);
// //   const todayGoals = await getPendingGoals(0, employeeId);

// //   if (twoDaysGoals.length > 0) {
// //     console.log("Goals Due in 2 Days");
// //   }

// //   if (oneDayGoals.length > 0) {
// //     console.log("Goals Due Tomorrow");
// //   }

// //   if (todayGoals.length > 0) {
// //     // await sendMail(employee.email, todayGoals, "Reminder: Goals Due Today");
// //     console.log("Goals due date");
// //   }
// //   // Retrieve the list of employees for the company
// //   // const employees = await getEmployees(companyId);

// //   // Loop through the list of employees and send email notifications for their pending goals
// //   // for (const employee of employees) {
// //   //   const twoDaysGoals = await getPendingGoals(2, companyId);
// //   //   const oneDayGoals = await getPendingGoals(1, companyId);
// //   //   const todayGoals = await getPendingGoals(0, companyId);

// //   //   if (twoDaysGoals.length > 0) {
// //   //     console.log("Goals Due in 2 Days");
// //   //   }

// //   //   if (oneDayGoals.length > 0) {
// //   //     console.log("Goals Due Tomorrow");
// //   //   }

// //   //   if (todayGoals.length > 0) {
// //   //     // await sendMail(employee.email, todayGoals, "Reminder: Goals Due Today");
// //   //     console.log("Goals due date");
// //   //   }
// //   // }
// // });

// // async function getCompanyIds() {
// //   try {
// //     await client.connect();
// //     const database = client.db("test");
// //     const employeesCollection = database.collection("employees");
// //     const employeeIDs = await employeesCollection.distinct("_id");
// //     // console.log(`Company IDs: ${employeeIDs}`);
// //     return employeeIDs;
// //   } catch (err) {
// //     console.log(err);
// //   } finally {
// //     await client.close();
// //   }
// // }

// // await getCompanyIds();

// export const sendEmailNotifications = asyncHandler(async () => {
//   try {
//     await client.connect();
//     const database = client.db("test");
//     const employeesCollection = database.collection("employees");
//     console.log(employeesCollection);

//     // for (const employeeId of employeeIDs) {
//     //   const employee = await employeesCollection.findOne({ _id: employeeId });
//     //   const taskDeadline = employee.taskDeadline;
//     //   // const daysUntilDeadline = moment(taskDeadline).diff(moment(), 'days');
//     //   // if (daysUntilDeadline === 1) {
//     //   //   // send email to employee
//     //   //   const email = employee.email;
//     //   //   const message = `Dear ${employee.name},\n\nThis is a reminder that your task deadline is tomorrow.\n\nBest regards,\nYour Company`;
//     //   //   await sendEmail(email, message);
//     //   // }
//     // }
//   } catch (err) {
//     console.log(err);
//   } finally {
//     await client.close();
//   }
// });

// export const getEmployees = asyncHandler(async (req, res, next) => {
//   const { companyID } = req.userAuth;
//   const employees = await Employee.find({ companyID });
//   return employees;
// });

// pushNotifications: {
//     type: Boolean,
//     default: false,
//   },
