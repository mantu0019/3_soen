import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import userModel from "../models/user.model.js";
import envConfig from "../config/env.js";
import redisClient from "../services/redies.services.js";

export const registerController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "All field are required",
      });
    }
    const isEmailExist = await userModel.findOne({ email });

    if (isEmailExist) {
      return res.status(401).json({
        success: false,
        message: "User already exists",
      });
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
  } catch (error) {
    console.log("something went wrong from userCreateController", error);
    res.status(500).json({
      success: false,
      message: "something went wrong from userCreateController",
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if ((!email, !password)) {
      return res.status(401).json({
        success: false,
        message: "All field are required",
      });
    }

    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "user not found",
      });
    }

    const checkPass = await bcrypt.compare(password, user.password);

    if (!checkPass) {
      return res.status(401).json({
        success: false,
        message: "Password in valid",
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
      message: "User login Successfully",
      userDetail,
    });
  } catch (error) {
    console.log("something went wrong form loginController", error);
    res.status(500).json({
      success: false,
      message: "something went wrong form loginController",
    });
  }
};

export const getMeController = async (req, res) => {
  try {
    const { id } = req.user;

    const userDetail = await userModel.findById(id);

    if (!userDetail) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "get data",
      userDetail,
    });
  } catch (error) {
    console.log("something went wrong from getMeController", error);
    res.status(500).json({
      success: false,
      message: "something went wrong from getMeController",
    });
  }
};


export const logOutController = async(req,res)=>{
  try {
     
       const token = req?.cookies?.token;
      if(!token){
        return res.status(401).json({
          success:false,
          message:"Unauthorized User"
        })
      }
      res.clearCookie("token")

      redisClient.set(token,'logout',"EX",60*60*7*24)
      res.status(200).json({
        success:true,
        message:"LogOut successfully"
      })



  } catch (error) {
    console.log("something went wrong from logOut Controller",error);
    res.status(500)
    .json({
      success:false,
      message:"something went wrong from logOut Controller"
    })
  }
}
