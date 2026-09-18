import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: [true, "email should be unique"],
      required: [true, "email is required"],
      trim: true,
      minLength: [6, "email min length at lest 6"],
      maxLength: [50, "email max length  under 50 "],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      select:false
    },
  },
  { timestamps: true },
);

const userModel = mongoose.model("Users", userSchema);

export default userModel;
