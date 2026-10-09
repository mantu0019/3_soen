import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../features/auth/state/authSlice';
import projectReducer from "../features/project/state/projectSlice"
 export const store = configureStore({
    reducer:{
        auth:authReducer,
        project:projectReducer
    }
})


 