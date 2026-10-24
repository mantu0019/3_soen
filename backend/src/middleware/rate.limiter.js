import {rateLimit} from "express-rate-limit";

export const loginLimiter = rateLimit({
    windowMs:15*60*1000,
    limit:5,
    standardHeaders:"draft-8",
    legacyHeaders:false,
    skipSuccessfulRequests:true,
    message:{
        success:false,
        message:"To many login attempts. please try again after 15 min."
    }
})
export const registerLimiter = rateLimit({
    windowMs:60*60*1000,
    limit:5,
    standardHeaders:"draft-8",
    legacyHeaders:false,
    skipSuccessfulRequests:true,
    message:{
        success:false,
        message:"To many registration attempts. please try again after 1 hr"
    }
});

export const authApiLimiter = rateLimit({
    windowMs:15*60*1000,
    limit:100,
    standardHeaders:"draft-8",
    legacyHeaders:false,
    message:{
        success:false,
        message:'To many request. Please try again later'
    }
})



