import mongoose from "mongoose";

export const dbConnection = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log("DataBase Connected Successfully");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
