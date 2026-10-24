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
  removeUserFromProject,
} from "../controller/project.controller.js";
import { authApiLimiter } from "../middleware/rate.limiter.js";

// Rate limiter import
 
const projectRouter = Router();

// Create Project
projectRouter.post(
  "/create",
  authApiLimiter,
  createProjectServices,
  validate,
  authMiddleware,
  createProject
);

// Get All Projects
projectRouter.get(
  "/get",
  authApiLimiter,
  authMiddleware,
  getAllProject
);

// Add User to Project
projectRouter.put(
  "/add-user",
  authApiLimiter,
  addUserValidator,
  validate,
  authMiddleware,
  addUserToProject
);

// Get Specific Project
projectRouter.get(
  "/get-project/:projectId",
  authApiLimiter,
  authMiddleware,
  getProjectController
);

// Remove User from Project
projectRouter.put(
  "/remove-user",
  authApiLimiter,
  addUserValidator,
  validate,
  authMiddleware,
  removeUserFromProject
);

export default projectRouter;