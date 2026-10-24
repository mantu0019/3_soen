import { Router } from "express";
import { getAllUserController, getMeController, loginController, logOutController, registerController,   } from "../controller/user.controller.js";
import { loginValidation, registerValidation, validate } from "../services/user.validation.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { authApiLimiter, loginLimiter, registerLimiter } from "../middleware/rate.limiter.js";

const authRouter = Router();
  
authRouter.post('/register',registerLimiter, registerValidation,validate,registerController);
authRouter.post("/login",loginLimiter, loginValidation,validate,loginController)
authRouter.get("/get-me",authApiLimiter,  authMiddleware,getMeController)
authRouter.get("/logOut",authApiLimiter, authMiddleware,logOutController)
authRouter.get("/allUser",authApiLimiter, authMiddleware,getAllUserController)

export default authRouter;
