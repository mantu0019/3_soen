import app from "./src/app.js";
import dns from "dns";
dns.setServers(["1.1.1.1","8.8.8.8"]);
import connectToDb from "./src/config/db.js";
import envConfig from "./src/config/env.js";
connectToDb()

  const port = envConfig.PORT || 5000;


  app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
  })





