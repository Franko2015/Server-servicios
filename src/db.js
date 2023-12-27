import { createPool } from "mysql2/promise";
import { config } from "dotenv";
config();

const desarrollo = {
  host: process.env.DEV_HOST,
  user: process.env.DEV_USER,
  password: process.env.DEV_PASS,
  port: process.env.DEV_PORT,
  database: process.env.DEV_BD,
};

const produccion = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASS,
  port: process.env.PORT,
  database: process.env.BD,
};

export const pool = createPool({
  host: desarrollo.host,
  user: desarrollo.user,
  password: desarrollo.password,
  port: desarrollo.port,
  database: desarrollo.database,
});

/*
export const pool = createPool({
  host: "db-solutio.cvuagilm4qak.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "leica666",
  port: "3306",
  database: "Solutio",
});
*/

