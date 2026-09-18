import mongoose from "mongoose";
import envConfig from "./env.js";

const connectToDb = () => {
  try {
    mongoose.connect(envConfig.MONGO_URI);
    console.log("Connect To Database");
  } catch (error) {
    console.log("something went wrong during database connection", error);
  }
};


export default connectToDb;