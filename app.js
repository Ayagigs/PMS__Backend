import express from "express";
import { dbConnection } from "./DBConnection/DBConnect.js";
import dotenv from "dotenv";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

dotenv.config();
dbConnection();

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
