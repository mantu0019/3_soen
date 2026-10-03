import { api } from "../../../app/api";

export const projectCreate = async ({ name }) => {
  try {
    const res = await api.post("/api/project/create", { name });
    return res.data;
  } catch (error) {
    console.log(
      "Project create failed:",
      error?.response?.data?.message || error.message,
    );
    throw error;
  }
};

export const getProject = async () => {
  try {
    const res = await api.get("/api/project/get");

    return res.data;
  } catch (error) {
    console.log(
      "get project failed:",
      error?.response?.data?.message || error.message,
    );
    throw error;
  }
};

export const addUser = async ({ projectId, user }) => {
  try {
    const res = await api.put("/api/project/add-user", {
      projectId,
      user,
    });

    return res.data;
  } catch (error) {
    console.log(
      "addUser failed:",
      error?.response?.data?.message || error?.message,
    );

    throw error;
  }
};

export const removeProject = async ({ projectId, user }) => {
  try {
    const res = await api.put("/api/project/remove-user", {
      projectId,
      user,
    });
    return res.data;
  } catch (error) {
    console.log(
      "Remove User Failed :",
      error?.response?.data?.message || error?.message,
    );
  }
};
