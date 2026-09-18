 
import { api } from "../../../app/api";
 
export const register = async ({ email, password }) => {
  try {
    const res = await api.post("/api/auth/register", { email, password });
    return res.data;
  } catch (error) {
    console.error("Register failed:", error.response?.data?.message || error.message);
    throw error;
  }
};

 
export const login = async ({ email, password }) => {
  try {
    const res = await api.post("/api/auth/login", { email, password });
    return res.data;
  } catch (error) {
    console.error("Login failed:", error.response?.data?.message || error.message);
    throw error;
  }
};

 
export const getMe = async () => {
  try {
    const res = await api.get("/api/auth/get-me");
    return res.data;
  } catch (error) {
    if (error.response?.status !== 401) {
      console.error("getMe failed:", error.response?.data?.message || error.message);
    }
    throw error;
  }
};

 
export const logOut = async () => {
  try {
    const res = await api.get("/api/auth/logOut");
    return res.data;
  } catch (error) {
    console.error("Logout failed:", error.response?.data?.message || error.message);
    throw error;
  }
};