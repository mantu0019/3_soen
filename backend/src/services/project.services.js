import { body, validationResult } from "express-validator";

export const createProjectServices = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")

    .normalizeEmail()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
];

 

export const addUserValidator = [
  body("projectId")
    .notEmpty()
    .withMessage("Project ID is required")
    .isMongoId()
    .withMessage("Invalid project ID"),

  body("user")
    .isArray({ min: 1 })
    .withMessage("User must be an array with at least one user"),

  body("user.*")
    .isMongoId()
    .withMessage("Invalid user ID"),
];


export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
};
