import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import envConfig from "../config/env.js";
import redisClient from "../services/redies.services.js";
 
const authMiddleware = async (req, res, next) => {
  try {
    const token = req?.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized User",
      });
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
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
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