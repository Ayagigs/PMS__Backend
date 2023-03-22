import express from "express";
import { dbConnection } from "./DBConnection/DBConnect.js";
import errorHandler from "./utils/errorHandler.js";
import dotenv from "dotenv";
import cors from "cors";
import startup from "./startup/routes.js";
import globalErrorHandler from "./controllers/errorHandlerController.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

dotenv.config();
dbConnection();

startup(app);

const port = process.env.PORT || 8000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

app.all("*", (req, res, next) => {
  next(new errorHandler(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Server is running at http:localhost:${port}`);
});
