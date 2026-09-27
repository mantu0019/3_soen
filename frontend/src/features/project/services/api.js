import { api } from "../../../app/api";

export const projectCreate = async ({ name }) => {
  try {
    const res = await api.post("/api/project/create", {name});
    return res.data;
  } catch (error) {
    console.log(
      "Project create failed:",
      error?.response?.data?.message || error.message,
    );
    throw error;
  }
};
