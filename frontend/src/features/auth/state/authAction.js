import { createAsyncThunk } from "@reduxjs/toolkit";
import { getMe, login, logOut, register } from "../services/api";

export const registerUser = createAsyncThunk(
  "/api/register",
  async (authData, thunkAPI) => {
    try {
      const res = await register(authData);
      return res;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "something went wrong",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "/api/login",
  async (authData, thunkAPI) => {
    try {
      const res = await login(authData);
      return res;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "something went wrong",
      );
    }
  },
);

export const getMeUser = createAsyncThunk(
  "/api/get-me",
  async (_, thunkAPI) => {
    try {
      const res = await getMe();
      return res;
    } catch (error) {
       
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "something went wrong",
      );
    }
  },
);

export const logOutUser = createAsyncThunk(
  "/api/logout",
  async (_, thunkAPI) => {
    try {
      const res = await logOut();
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "something went wrong ",
      );
    }
  },
);
