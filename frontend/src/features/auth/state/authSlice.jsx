import { createSlice } from "@reduxjs/toolkit";
import { getAllUsers, getMeUser, loginUser, logOutUser, registerUser } from "./authAction";
 
const authSlice = createSlice({
    name:"auth",
    initialState:{
        authData:null,
     
        isLoading:true,
        error:null,
    },
    extraReducers:(builder)=>{
        return builder.addCase(registerUser.pending,(state,action)=>{
             state.isLoading = true,
             state.error = null
        }).addCase(registerUser.fulfilled,(state,action)=>{
            state.isLoading = false,
            
            state.authData = action.payload,
            state.error     = null
        }).addCase(registerUser.rejected,(state,action)=>{
            state.isLoading = false,
            state.error = action.payload || "Error In Register"
        })
        // login start here.....
       .addCase(loginUser.pending,(state)=>{
              state.isLoading = true,
              state.error = null
       }).addCase(loginUser.fulfilled,(state,action)=>{
        console.log("login..",action.payload)
        state.isLoading = false,
        state.authData = action.payload,
        
        state.error   = null
       }).addCase(loginUser.rejected,(state,action)=>{
        state.isLoading = false,
        state.error   = action?.payload || "error in login"
       })
       // getMe start here......
       .addCase(getMeUser.pending,(state)=>{
        state.isLoading = true,
        state.error = null
       }).addCase(getMeUser.fulfilled,(state,action)=>{
        state.isLoading = false,
        state.authData = action?.payload,
        state.error   = null

       }).addCase(getMeUser.rejected,(state)=>{
        state.isLoading = false,
        
        state.error = null

        })

        // logOut

        .addCase(logOutUser.fulfilled,(state)=>{
            state.error = false,
            state.authData  = null,
            state.accessToken = null,
         state.isLoading = null
        }).addCase(getAllUsers.pending,(state)=>{
         state.isLoading    = false,
        state.error   = null
    }).addCase(getAllUsers.fulfilled,(state,action)=>{
      state.isLoading = false,
      state.error  = null,
      state.authData = action?.payload


    }).addCase(getAllUsers.rejected,(state,action)=>{
        state.isLoading = false,
        state.error = action.payload
    })




    }
})

export default authSlice.reducer;