import { Router } from "express";
import { getMeController, loginController, logOutController, registerController,   } from "../controller/user.controller.js";
import { loginValidation, registerValidation, validate } from "../services/user.validation.js";
import authMiddleware from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post('/register',registerValidation,validate,registerController);
authRouter.post("/login",loginValidation,validate,loginController)
authRouter.get("/get-me",authMiddleware,getMeController)
authRouter.get("/logOut",authMiddleware,logOutController)

export default authRouter;
