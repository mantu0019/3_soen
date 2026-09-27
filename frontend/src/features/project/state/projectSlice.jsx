import { createSlice } from "@reduxjs/toolkit";
import { projectCreateUser } from "./projectAction";

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


    }
})


export default projectSlice.reducer;