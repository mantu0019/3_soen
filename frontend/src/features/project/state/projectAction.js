import { createAsyncThunk } from "@reduxjs/toolkit";
import { projectCreate } from "../services/api";

export const projectCreateUser = createAsyncThunk(
  "/api/project/create",
  async (projectData, thunkAPI) => {
    try {
      const res = await projectCreate(projectData);
      return res;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "something went wrong",
      );
    }
  },
);
