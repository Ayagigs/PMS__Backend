import Employee from "../model/EmployeeModel.js";
import Goal from "../model/GoalModel.js";
import Admin from "../model/adminModel.js";
import mongoose from "mongoose";
import { CronJob } from "cron";
import OneSignal from "onesignal-node";
// import admin from "firebase-admin";

import { MongoClient } from "mongodb";
const uri = process.env.CONNECTION_STRING;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
import errorHandler from "../utils/errorHandler.js";
import asyncHandler from "express-async-handler";
import { getPendingGoals } from "../utils/pendingGoals.js";
import { emailSender } from "../utils/emailSender.js";
import Notification from "../model/notificationSchema.js";

export const addGoal = asyncHandler(async (req, res, next) => {
  const {
    goaltitle,
    startdate,
    enddate,
    category,
    description,
    keyobjectives,
  } = req.body;
  const goalOwner = await Employee.findById(req.userAuth._id);

  if (!mongoose.Types.ObjectId.isValid(req.userAuth._id)) {
    return next(new errorHandler("Invalid objectID", 404));
  }

  if (!goalOwner) {
    return next(new errorHandler("Invalid or Expired token", 404));
  }

  const today = new Date();
  let status = "";

  if (today >= startdate && today <= enddate) {
    status = "In Progress";
  } else if (today >= enddate) {
    status = "Overdue";
  } else {
    status = "Not Started";
  }

  try {
    const goal = await Goal.create({
      goaltitle,
      startdate,
      enddate,
      category,
      description,
      status: status,
      keyobjectives,
      companyID: goalOwner.companyID,
      owner: goalOwner._id,
    });

    goalOwner.goals.push(goal._id);
    await goalOwner.save();
    await goal.save();

    const pm = await Employee.find({
      companyID: goalOwner.companyID,
      department: goalOwner.department,
      role: "Performance Manager",
    });
    const hr = await Employee.find({
      companyID: goalOwner.companyID,
      department: goalOwner.department,
      role: "HR Manager",
    });

    for (var i = 0; i < pm.length; i++) {
      pm[i].goalsToReview.push(goal._id);

      await pm[i].save();
    }

    for (var i = 0; i < hr.length; i++) {
      hr[i].goalsToReview.push(goal._id);
      await hr[i].save();
    }

    res.status(200).json({
      success: true,
      data: goal,
    });

    if (status === "Not Started") {
      setTimeout(async () => {
        await Goal.findByIdAndUpdate(
          goal._id,
          {
            $set: {
              status: "In Progress",
            },
          },
          {
            new: true,
          }
        );
      }, startdate - today);

      setTimeout(async () => {
        const goal = await Goal.findById(goal._id);

        if (goal.status == "In Progress") {
          goal.status = "Overdue";

          await goal.save();
        }
      }, enddate - new Date());
    }

    if (status === "In Progress") {
      setTimeout(async () => {
        const goal = await Goal.findById(goal._id);

        if (goal.status == "In Progress") {
          goal.status = "Overdue";

          await goal.save();
        }
      }, enddate - today);
    }
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
});

export const getEmployeeAndGoal = asyncHandler(async (req, res, next) => {
  try {
    const { companyID } = req.params;
    if (!mongoose.Types.ObjectId.isValid(companyID)) {
      return next(new errorHandler("Invalid objectID", 404));
    }

    const employees = await Goal.find({ companyID })
      .populate("owner")
      .populate({
        path: "reviews",
        populate: {
          path: "reviewer",
        },
      });

    res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
});

export const getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ owner: req.userAuth._id }).populate(
      "reviewers"
    ).populate({
      path: "reviews",
      populate: {
        path: "reviewer",
      },
    });

    res.status(200).json({
      success: true,
      data: goals,
    });
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
};

export const getAllCompanyGoals = async (req, res) => {
  const { companyID } = req.params;
  try {
    const goals = await Goal.find({ companyID: companyID }).populate(
      "reviewers"
    );

    res.status(200).json({
      success: true,
      data: goals,
    });
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
};

export const editGoal = asyncHandler(async (req, res, next) => {
  const {
    goaltitle,
    startdate,
    enddate,
    category,
    description,
    keyobjectives,
    status,
    isCompleted,
    reviewers,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new errorHandler("Invalid objectID", 404));
  }

  const goal = await Goal.findById(req.params.id);
  if (!goal) {
    return next(new errorHandler("Goal not found", 404));
  }
  try {
    const editedgoal = await Goal.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          goaltitle,
          startdate,
          enddate,
          category,
          description,
          keyobjectives,
          status,
          isCompleted,
          reviewers,
        },
      },
      {
        new: true,
      }
    );

    for (var i = 0; i < reviewers.length; i++) {
      const employee = await Employee.findById(reviewers[i]);

      if (!employee) {
        return next(new errorHandler("Employee not found", 404));
      }

      if (employee.goalsToReview.includes(editedgoal._id)) {
        continue;
      }

      employee.goalsToReview.push(editedgoal._id);
      console.log(employee.goalsToReview);

      await employee.save();
    }

    res.status(200).json({
      success: true,
      data: editGoal,
    });
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
});

export const findGoalById = asyncHandler(async (req, res, next) => {
  const { goalID } = req.params;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new errorHandler("Invalid objectID", 404));
  }

  const goal = await Goal.findById(goalID).populate("reviews");

  if (!goal) {
    return next(new errorHandler("Goal not found", 404));
  }

  res.status(200).json({
    success: true,
    data: goal,
  });
});

async function employeeIDs() {
  try {
    await client.connect();
    const database = client.db("test");
    const employeesCollection = database.collection("employees");
    const employeeIDs = await employeesCollection.distinct("_id");

    return employeeIDs;
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
}

await employeeIDs();

async function sendEmailNotifications(employeeIDs) {
  try {
    await client.connect();
    const database = client.db("test");
    const employeesCollection = database.collection("employees");

    const twoDaysGoals = await getPendingGoals(2, employeeIDs);
    const oneDayGoals = await getPendingGoals(1, employeeIDs);
    const todayGoals = await getPendingGoals(0, employeeIDs);

    if (twoDaysGoals.length > 0) {
      for (const goal of twoDaysGoals) {
        const owner = await employeesCollection.findOne({ _id: goal.owner });
        console.log(owner);
        const { goaltitle } = goal;
        console.log(
          `Hello ${owner.firstName}, your goal "${goaltitle}" is Due in 2 Days  `
        );
        const message = `

    <div
        style="
          width: 658px;
          border-radius: 0px;
          padding: 48px;
          background: #f1f3f4;
        "
      >
        <h2>Hello ${owner.firstName},</h2>
        <p>
        your goal "${goaltitle}" is Due in 2 Days 
        </p>

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
            href=""
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
            >See Goals</a
          >
        </p>

        <p><Regards.../P>
        <p>Aya Team4</p>
      </div>
    `;

        const subject = "Task Deadline";
        const send_to = owner.workEmail;
        const sent_from = process.env.EMAIL_USER;

        try {
          await emailSender(subject, message, send_to, sent_from);
        } catch (error) {
          res.status(500).send({ status: "Fail", message: error.message });
        }
      }
    }

    if (oneDayGoals.length > 0) {
      for (const goal of oneDayGoals) {
        const owner = await employeesCollection.findOne({ _id: goal.owner });
        console.log(owner);
        const { goaltitle } = goal;
        console.log(
          `Hello ${owner.firstName}, your goal "${goaltitle}" is Due in 1 Day  `
        );

        const message = `

        <div
            style="
              width: 658px;
              border-radius: 0px;
              padding: 48px;
              background: #f1f3f4;
            "
          >
            <h2>Hello ${owner.firstName},</h2>
            <p>
            your goal "${goaltitle}" is Due in 1 Day 
            </p>
    
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
                href="#"
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
                >See Goals</a
              >
            </p>
    
            <p><Regards.../P>
            <p>Aya Team4</p>
          </div>
        `;

        const subject = "Task Deadline";
        const send_to = owner.workEmail;
        const sent_from = process.env.EMAIL_USER;

        try {
          await emailSender(subject, message, send_to, sent_from);
        } catch (error) {
          res.status(500).send({ status: "Fail", message: error.message });
        }
      }
    }

    if (todayGoals.length > 0) {
      for (const goal of todayGoals) {
        const owner = await employeesCollection.findOne({ _id: goal.owner });
        const { goaltitle } = goal;

        console.log(
          `Hello ${owner.firstName}, your goal "${goaltitle}" is Due today  `
        );

        const message = `

        <div
            style="
              width: 658px;
              border-radius: 0px;
              padding: 48px;
              background: #f1f3f4;
            "
          >
            <h2>Hello ${owner.firstName},</h2>
            <p>
            your goal "${goaltitle}" is Due Today 
            </p>
    
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
                href="#"
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
                >See Goals</a
              >
            </p>
    
            <p><Regards.../P>
            <p>Aya Team4</p>
          </div>
        `;

        const subject = "Task Deadline";
        const send_to = owner.workEmail;
        const sent_from = process.env.EMAIL_USER;

        try {
          await emailSender(subject, message, send_to, sent_from);
        } catch (error) {
          res.status(500).send({ status: "Fail", message: error.message });
        }
      }
    }
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
}

const job = new CronJob("45 0 * * *", async function (req, res, next) {
  console.log("Cron started");
  const employeeid = await employeeIDs();
  for (const employee of employeeid) {
    await sendEmailNotifications(employee);
  }
});

job.start();

// Update notification toggle button fields
export const updateNotifications = asyncHandler(async (req, res, next) => {
  const updateFields = req.body;
  console.log(req.userAuth._id);

  try {
    let notification = await Notification.findOne({
      employeeID: req.userAuth._id,
    });
    console.log(notification);

    if (!notification) {
      // Create new notification document if it doesn't exist
      notification = new Notification({
        employeeID: req.userAuth._id,
        ...updateFields,
      });

      await notification.save();
    } else {
      // Update existing notification document
      notification.set(updateFields);
      notification.updatedAt = Date.now();
      await notification.save();
    }

    res.status(200).json({ success: true, notification });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: "Failed to create or update notifications",
    });
  }
});

// Send push notification for goal deadline
export const sendGoalDeadlineNotification = asyncHandler(
  async (req, res, next) => {
    try {
      const user = await Notification.findOne({ user: req.userAuth._id });
      if (!user) return res.status(404).json({ msg: "User not found" });

      const employee = await Employee.findById(req.userAuth._id);

      const { _id } = employee;

      const { pushGoalDeadline } = user;

      if (pushGoalDeadline) {
        const twoDaysGoals = await getPendingGoals(2, _id);
        const oneDayGoals = await getPendingGoals(1, _id);
        const todayGoals = await getPendingGoals(0, _id);

        if (twoDaysGoals.length > 0) {
          for (const goal of twoDaysGoals) {
            const owner = await Employee.findOne({
              _id: goal.owner,
            });

            const { goaltitle } = goal;
            console.log(
              `Hello ${owner.firstName}, your goal "${goaltitle}" is Due in 2 Days  `
            );
          }
        }

        if (oneDayGoals.length > 0) {
          for (const goal of oneDayGoals) {
            const owner = await Employee.findOne({
              _id: goal.owner,
            });

            const { goaltitle } = goal;
            console.log(
              `Hello ${owner.firstName}, your goal "${goaltitle}" is Due in 1 Day  `
            );
          }
        }

        if (todayGoals.length > 0) {
          for (const goal of todayGoals) {
            const owner = await Employee.findOne({
              _id: goal.owner,
            });

            const { goaltitle } = goal;
            console.log(
              `Hello ${owner.firstName}, your goal "${goaltitle}" is Due Today  `
            );

            const notification = new OneSignal.Notification({
              contents: {
                en: `Hello ${owner.firstName}, your goal "${goaltitle}" is Due Today  `,
              },
              headings: {
                en: "Goal Deadline Reminder",
              },
              include_player_ids: [user.oneSignalPlayerId],
            });
            await OneSignal.sendNotification(notification);
            res.json({ msg: "Push notification sent" });
          }
        }
      }
    } catch (err) {
      console.error(err.message);
      return next(new errorHandler("Failed to send Notifications", 500));
    }
  }
);
