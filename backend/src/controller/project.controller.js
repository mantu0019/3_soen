import mongoose from "mongoose";
import projectModel from "../models/project.model.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";
import userModel from "../models/user.model.js";

export const createProject = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const userId = req.user;

  const nameAllReadyExists = await projectModel.findOne({ name });
  if (nameAllReadyExists) {
    throw new AppError("Name should be unique");
  }

  if (!userId) {
    throw new AppError("Unauthorized User", 400);
  }

  if (!name) {
    throw new AppError("All Field are required", 401);
  }

  const newProject = await projectModel.create({ name, user: [userId._id] });
  if (!newProject) {
    throw new AppError("Porject Not Created Some Reason");
  }

  res.status(201).json({
    success: true,
    message: "new project created",
    newProject,
  });
});

export const getAllProject = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const allProductName = await projectModel.find({
    user: userId,
  });

  if (!allProductName) {
    throw new AppError("All product Name Not Found", 401);
  }

  res.status(200).json({
    success: true,
    message: "fetched all data",
    allProductName,
  });
});

export const addUserToProject = asyncHandler(async (req, res) => {
  const { projectId, user } = req.body;

  const loggedInUser = await userModel.findById(req.user._id);

  if (!loggedInUser) {
    throw new AppError("LoggedIn user not found", 404);
  }

  if (!projectId || !user) {
    throw new AppError("ProjectId or user is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new AppError("Invalid ProjectId", 400);
  }

  if (
    !Array.isArray(user) ||
    user.some((userId) => !mongoose.Types.ObjectId.isValid(userId))
  ) {
    throw new AppError("Invalid userId in user array", 400);
  }

  const project = await projectModel.findOne({
    _id: projectId,
    user: loggedInUser._id,
  });

  if (!project) {
    throw new AppError("User does not belong to this project", 403);
  }

  // Add requested users
  const updatedProject = await projectModel.findByIdAndUpdate(
    projectId,
    {
      $addToSet: {
        user: {
          $each: user,
        },
      },
    },
    {
      new: true,
    },
  );

  if (!updatedProject) {
    throw new AppError("Project update failed", 500);
  }

  res.status(200).json({
    success: true,
    message: "Users added to project successfully",
    project: updatedProject,
  });
});

export const getProjectController = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw new AppError("projectId is required", 401);
  }

  const project = await projectModel.findById(projectId);

  if (!project) {
    throw new AppError("Project Not Found", 401);
  }

  res.status(200).json({
    success: false,
    message: "fetched project successfully",
    project,
  });
});

export const removeUserFromProject = asyncHandler(async (req, res) => {
  const { projectId, user } = req.body;

  const loggedInUser = await userModel.findOne(req.user._id);

  if (!loggedInUser) {
    throw new AppError("LoggedIn user Not Found", 400);
  }

  if (!projectId || !user) {
    throw new AppError("All Field Are Required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new AppError("Invalid Project id", 400);
  }

  if (
    !Array.isArray(user) ||
    user.length === 0 ||
    user.some((userId) => !mongoose.Types.ObjectId.isValid(userId))
  ) {
    throw new AppError("Invalid userId in user array", 400);
  }
  const project = await projectModel.findOne({
    _id: projectId,
    user: loggedInUser._id,
  });

  if (!project) {
    throw new AppError("User does not belong to this project", 329);
  }

  if (user.some((id) => id.toString() === loggedInUser._id.toString())) {
    throw new AppError("you can not remove yourself from the project");
  }

  const updatedProject = await projectModel.findByIdAndUpdate(
    projectId,
    { $pull: { user: { $in: user } } },
    { new: true },
  );

  if (!updatedProject) {
    throw new AppError("Project Updated failed:", 500);
  }

  res.status(200).json({
    success: true,
    message: "updated Project successfully",
    project: updatedProject,
  });
});
