import projectModel from "../models/project.model.js";

export const createProject = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user;
    console.log("🚀 ~ createProject ~ userId:", userId.id);

    if (!userId) {
      return;
      res.status(401).json({
        success: false,
        message: "Unauthorized User",
      });
    }

    if (!name) {
      return res.status(401).json({
        success: false,
        message: "all field are required",
      });
    }

    const newProject = await projectModel.create({ name, user: userId._id });
    if (!newProject) {
      return res.status(401).json({
        success: false,
        message: "something went wrong in newProject",
      });
    }

    res.status(201).json({
      success: true,
      message: "new project created",
      newProject,
    });
  } catch (error) {
    console.log("something went wrong from create project controller", error);
  }
};
