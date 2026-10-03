import { createSlice } from "@reduxjs/toolkit";
import { addUsers, getProjectUser, projectCreateUser, removeProjectUser } from "./projectAction";

const projectSlice = createSlice({
    name:"project",
    initialState:{
        projectData:[],
        isLoading:false,
        error:null
    },
    extraReducers:(builder)=>{

    builder.addCase(projectCreateUser.pending,(state)=>{
 
    state.isLoading = true;
    state.error = null;
    }).addCase(projectCreateUser.fulfilled,(state,action)=>{

    state.isLoading = false;
    state.projectData.push(action.payload);
    state.error = null;
    }).addCase(projectCreateUser.rejected,(state,action)=>{
        state.isLoading = false;
        state.error = action?.payload;
        
       })
    .addCase(getProjectUser.pending,(state)=>{
     
      state.isLoading = false;
      state.error = null;
      

    }).addCase(getProjectUser.fulfilled,(state,action)=>{
            
       state.isLoading = false;
       state.error = null;
        state.projectData = action.payload.allProductName || [];
         
    }).addCase(getProjectUser.rejected,(state,action)=>{
        state.isLoading = false;
        state.error = action?.payload;
    }).addCase(addUsers.pending,(state )=>{
             state.isLoading = true;
             state.error = null;

    }).addCase(addUsers.fulfilled,(state,action)=>{
        state.isLoading = false;
        state.error = null;
         const updatedProject = action.payload.project;
         const index = state.projectData.findIndex(
            (project)=>project._id=== updatedProject._id
         );
         if(index !==-1){
            state.projectData[index] = updatedProject;
         }



    }).addCase(addUsers.rejected,(state,action)=>{
         state.isLoading   = false;
         state.error = action?.payload;

    }).addCase(removeProjectUser.pending,(state)=>{
       state.isLoading   = true;
       state.error  = null;

    }).addCase(removeProjectUser.fulfilled,(state,action)=>{
        state.isLoading = false;
        state.error = null;
        state.projectData   = action?.payload;
    }).addCase(removeProjectUser.rejected,(state,action)=>{
        state.isLoading = false;
        state.error  = action?.payload;
        
    })
 
     }
})


export default projectSlice.reducer;