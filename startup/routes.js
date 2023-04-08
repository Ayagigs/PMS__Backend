import express from "express";
import adminRoute from "../routes/adminRoutes.js";
import departmentRoute from "../routes/departmentRoutes.js";
import employeeRoute from "../routes/employeeRoutes.js";
import categoryRoute from "../routes/goalcategoryRoutes.js";
import goalRoute from "../routes/goalRoutes.js";
import questionRoute from "../routes/questionRoutes.js";
import reviewRoute from "../routes/reviewRoutes.js";
import transactionRoute from "../routes/transactionRoutes.js";
import Employee from "../model/EmployeeModel.js";
import Admin from "../model/adminModel.js";

export default function (app) {
  //   app.use(express.json());
  app.use("/api/v1/admin", adminRoute);
  app.use("/api/v1/employee", employeeRoute);
  app.use("/api/v1/goal", goalRoute);
  app.use("/api/v1/review", reviewRoute);
  app.use("/api/v1/department", departmentRoute);
  app.use("/api/v1/category", categoryRoute);
  app.use("/api/v1/question", questionRoute);
  app.use("/api/v1/wallet", transactionRoute);
  app.use("/auth/google/callback", async (req, res, next) => {
    try {
      // Check if user is an employee
      const employee = await Employee.findOne({ workEmail: req.body.email });
      if (employee) {
        const token = employee.generateToken();
        res.status(200).json({ status: "succes", data: { employee, token } });
        return;
      }

      // Check if user is an admin
      const admin = await Admin.findOne({ email: req.body.email });
      if (admin) {
        const token = admin.generateToken();
        res.status(200).json({ status: "succes", data: { admin, token } });
        return;
      }

      // User not found
      res.status(404).json({
        message: "kindly login with your company email address",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
}
