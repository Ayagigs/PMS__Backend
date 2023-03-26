import express from "express";
import adminRoute from "../routes/adminRoutes.js";
import departmentRoute from "../routes/departmentRoutes.js";
import employeeRoute from "../routes/employeeRoutes.js";
import categoryRoute from "../routes/goalcategoryRoutes.js";
import goalRoute from "../routes/goalRoutes.js";
import questionRoute from "../routes/questionRoutes.js";
import reviewRoute from "../routes/reviewRoutes.js";

export default function (app) {
  //   app.use(express.json());
  app.use("/api/v1/admin", adminRoute);
  app.use("/api/v1/employee", employeeRoute);
  app.use("/api/v1/goal", goalRoute);
  app.use("/api/v1/review", reviewRoute);
  app.use("/api/v1/department", departmentRoute);
  app.use("/api/v1/category", categoryRoute);
  app.use("/api/v1/question", questionRoute);
  app.use("/auth/google/callback", async (req, res, next) => {
    const { tokenId } = req.body;

    res.send({ status: "Success", tokenId });
    console.log("Success Dev");
    client
      .verifyIdToken({
        idToken: tokenId,
        audience:
          "685377135851-fem8icfu49q7ui3mu36ujdrfftsdda6b.apps.googleusercontent.com",
      })
      .then((response) => {
        const { email_verified } = response.payload;
        console.log(response.payload);
      });
  });
}
