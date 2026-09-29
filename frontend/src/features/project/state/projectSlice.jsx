import { createSlice } from "@reduxjs/toolkit";
import { getProjectUser, projectCreateUser } from "./projectAction";

const projectSlice = createSlice({
    name:"project",
    initialState:{
        projectData:[],
        isLoading:false,
        error:null
    },
    extraReducers:(builder)=>{

    builder.addCase(projectCreateUser.pending,(state)=>{
 
    state.isLoading = true,
    state.error = null;
    }).addCase(projectCreateUser.fulfilled,(state,action)=>{

    state.isLoading = false,
    state.projectData.push(action.payload);
    state.error = null;
    }).addCase(projectCreateUser.rejected,(state,action)=>{
        state.isLoading = false,
        state.error = action?.payload;
        
       })
    .addCase(getProjectUser.pending,(state)=>{
     
      state.isLoading = false,
      state.error = null    
      

    }).addCase(getProjectUser.fulfilled,(state,action)=>{
            
       state.isLoading = false,
       state.error = null,
        state.projectData = action.payload.allProductName || [];
         
    }).addCase(getProjectUser.rejected,(state,action)=>{
        state.isLoading = false,
        state.error = action?.payload
    })
 
     }
})


export default projectSlice.reducer;