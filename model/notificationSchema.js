import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  employeeID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  pushCommentNotification: {
    type: Boolean,
    default: false,
  },
  pushGoalDeadlineNotification: {
    type: Boolean,
    default: false,
  },
  emailCommentNotification: {
    type: Boolean,
    default: false,
  },
  emailNewsUpdateNotification: {
    type: Boolean,
    default: false,
  },
  emailReminderNotification: {
    type: Boolean,
    default: false,
  },
  oneSignalId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

//i am building an application where different companies can get registered and the admin can add employees. the employees can set goal deadlines to their task. in react ui, i have six different toggle buttons for email and push notifications. for the toggle buttons, i have push notifications for goal deadline and another toggle button for push notifications for comments. the other two buttons are email notifications for task deadline and email notifications for comments. i want to send push notifications to user using onesignal assuming they toggle for goal deadline push notifications. i am using mern. can i see the controllers and the react side of the code
