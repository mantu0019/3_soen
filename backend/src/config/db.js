import mongoose from "mongoose";
import envConfig from "./env.js";

const connectToDb = async () => {
  try {
    await mongoose.connect(envConfig.MONGO_URI);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    process.exit(1);
  }
};

export default connectToDb;