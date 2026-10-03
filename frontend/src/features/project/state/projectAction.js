import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  addUser,
  getProject,
  projectCreate,
  removeProject,
} from "../services/api";

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

export const addUsers = createAsyncThunk(
  "/api/project/add-user",
  async (projectData, thunkAPI) => {
    try {
      const res = await addUser(projectData);
      return res;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Something went wrong",
      );
    }
  },
);

export const removeProjectUser = createAsyncThunk(
  "/api/project/remove-user",
  async (projectData, thunkAPI) => {
    try {
      const res = await removeProject(projectData);
      return res;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "something went wrong",
      );
    }
  },
);
