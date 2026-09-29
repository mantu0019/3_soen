import { createAsyncThunk } from "@reduxjs/toolkit";
import { getProject, projectCreate } from "../services/api";

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

export const getProjectUser = createAsyncThunk(
  "/api/project/get",
  async (_, thunkAPI) => {
    try {
      const res = await getProject();
      return res;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "something went wrong",
      );
    }
  },
);
