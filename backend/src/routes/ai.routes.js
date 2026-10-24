import { Router } from "express";
import { getResult } from "../controller/ai.controller.js";

const aiRouter = Router();

aiRouter.get("/get-result", getResult);

export default aiRouter;
