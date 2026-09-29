import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  addUserValidator,
  createProjectServices,
  validate,
} from "../services/project.services.js";

import {
  addUserToProject,
  createProject,
  getAllProject,
  getProjectController,
} from "../controller/project.controller.js";

const projectRouter = Router();

projectRouter.post(
  "/create",
  createProjectServices,
  validate,
  authMiddleware,
  createProject,
);


projectRouter.get("/get", authMiddleware, getAllProject);
projectRouter.put(
  "/add-user",
  addUserValidator,
  validate,
  authMiddleware,
  addUserToProject,
);

projectRouter.get(
  "/get-project/:projectId",
  authMiddleware,
  getProjectController,
);

export default projectRouter;
