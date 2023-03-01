import express from "express";
import { dbConnection } from "./DBConnection/DBConnect.js";
import dotenv from "dotenv";
import cors from "cors";
import ceoRoute from "./routes/ceoRoutes.js";
import employeeRoute from "./routes/employeeRoutes.js";
import goalRouter from "./routes/goalRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

dotenv.config();
dbConnection();



app.use("/api/v1/ceo", ceoRoute)
app.use("/api/v1/employee", employeeRoute)
app.use("/api/v1/goal", goalRouter)



const port = process.env.PORT || 8000;

app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    data: {
      message: `Can't find ${req.originalUrl} on this server`,
    },
  });
});

app.listen(port, () => {
  console.log(`Server is running at http:localhost:${port}`);
});
