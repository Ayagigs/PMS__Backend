import express from "express";
import adminRoute from "../routes/adminRoutes.js";
import employeeRoute from "../routes/employeeRoutes.js";
import goalRoute from "../routes/goalRoutes.js";
import questionRoute from "../routes/questionRoutes.js";
import reviewRoute from "../routes/reviewRoutes.js";

export default function (app) {
  //   app.use(express.json());
  app.use("/api/v1/admin", adminRoute);
  app.use("/api/v1/employee", employeeRoute);
  app.use("/api/v1/goal", goalRoute);
  app.use("/api/v1/review", reviewRoute)
  app.use("/api/v1/question", questionRoute)
}
