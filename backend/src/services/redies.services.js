import Redis from "ioredis";
import envConfig from "../config/env.js";

const redisClient = new Redis({
    host:envConfig.REDIS_HOST,
    port:envConfig.REDIS_PORT,
    password:envConfig.REDIS_PASSWORD
});

redisClient.on("connect",()=>{
    console.log("Redis connected")
})


export default redisClient