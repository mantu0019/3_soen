import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import userModel from "../models/user.model.js";
import envConfig from "../config/env.js";
import redisClient from "../services/redies.services.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";

export const registerController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("All field are required", 400);
  }
  const isEmailExist = await userModel.findOne({ email });

  if (isEmailExist) {
    throw new AppError("user already exists", 400);
  }

  const hashPass = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    email,
    password: hashPass,
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User not create some reason",
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    envConfig.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.cookie("token", token);

  const userDetail = user.toObject();
  delete userDetail.password;

  res.status(201).json({
    success: true,
    message: "user Register successfully",
    userDetail,
  });
});

export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ((!email, !password)) {
    throw new AppError("All field are required", 400);
  }

  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("User Not Found", 401);
  }

  const checkPass = await bcrypt.compare(password, user.password);

  if (!checkPass) {
    throw new AppError("Password or Email Are Invalid");
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    envConfig.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.cookie("token", token);

  const userDetail = user.toObject();

  delete userDetail.password;

  res.status(201).json({
    success: true,
    message: "User login Successfully",
    userDetail,
  });
});

export const getMeController = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const userDetail = await userModel.findById(id);

  if (!userDetail) {
    throw new AppError("Unauthorized User");
  }

  return res.status(200).json({
    success: true,
    message: "get data",
    userDetail,
  });
});

export const logOutController = asyncHandler(async (req, res) => {
  const token = req?.cookies?.token;
  if (!token) {
    throw new AppError("Login Again");
  }
  res.clearCookie("token");

  redisClient.set(token, "logout", "EX", 60 * 60 * 7 * 24);
  res.status(200).json({
    success: true,
    message: "LogOut successfully",
  });
});
