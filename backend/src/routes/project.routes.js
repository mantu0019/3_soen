import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createProjectServices,
  validate,
} from "../services/project.services.js";
import { createProject } from "../controller/project.controller.js";

const projectRouter = Router();

projectRouter.post(
  "/create",
  createProjectServices,
  validate,
  authMiddleware,
  createProject,
);

export default projectRouter;
