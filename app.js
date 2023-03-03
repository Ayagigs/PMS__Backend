import express from "express";
import { dbConnection } from "./DBConnection/DBConnect.js";
import errorHandler from "./utils/errorHandler.js";
import dotenv from "dotenv";
import cors from "cors";
import adminRoute from "./routes/adminRoutes.js";
import startup from "./startup/routes.js";
// import employeeRoute from "./routes/employeeRoutes.js";
// import goalRouter from "./routes/goalRoutes.js";
import globalErrorHandler from "./controller/errorHandlerController.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

dotenv.config();
dbConnection();

startup(app);

// app.use("/api/v1/admin", adminRoute);
// app.use("/api/v1/employee", employeeRoute);
// app.use("/api/v1/goal", goalRouter);

const port = process.env.PORT || 8000;

app.all("*", (req, res, next) => {
  next(new errorHandler(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Server is running at http:localhost:${port}`);
});
