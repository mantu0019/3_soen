import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "project name should be unique"],
      lowercase: true,
      required: true,
      trim: true,
    },

    user: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
  },
  { timestamps: true }
);

const projectModel = mongoose.model("projects", projectSchema);

export default projectModel;