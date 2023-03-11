import express from "express";
import adminRoute from "../routes/adminRoutes.js";
import employeeRoute from "../routes/employeeRoutes.js";
import goalRoute from "../routes/goalRoutes.js";

export default function (app) {
  //   app.use(express.json());
  app.use("/api/v1/admin", adminRoute);
  app.use("/api/v1/employee", employeeRoute);
  app.use("/api/v1/goal", goalRoute);
}
