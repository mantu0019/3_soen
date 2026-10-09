import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import envConfig from "../config/env.js";
import redisClient from "../services/redies.services.js";
import AppError from "../utils/appError.js";
 
const authMiddleware = async (req, res, next) => {
  try {
    const token =  req?.cookies?.token;

    if (!token) {
      throw new AppError("Unauthorized User",401)
    }
   const isBlacklisting = await redisClient.get(token);
    if(isBlacklisting){

       res.cookie('token', "")

       return res.status(401).json({
        success:false,
        message:"login Again"
       })
    }


    const decode = jwt.verify(token, envConfig.JWT_SECRET);

    const userDetail = await userModel.findById(decode.id).select("-password");

    if (!userDetail) {
       throw new AppError("User not Found")
    }

    req.user = userDetail;
    next();
  } catch (error) {
    console.log("something went wrong from authMiddleware", error);
    res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};


export default authMiddleware