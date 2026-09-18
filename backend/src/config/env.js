import dotenv from "dotenv";
dotenv.config();

if (!process.env.PORT) {
  throw new Error("PORT is missing in .env");
}

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is missing in .env");
}
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in .env");
}
if (!process.env.REDIS_HOST) {
  throw new Error("REDIS_HOST is missing in .env");
}
if (!process.env.REDIS_PASSWORD) {
  throw new Error("REDIS_PASSWORD is missing in .env");
}
if (!process.env.REDIS_PORT) {
  throw new Error("REDIS_PORT is missing in .env");
}
const envConfig = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_PORT: process.env.REDIS_PORT,
};

export default envConfig;
