import { createPool } from "mysql2/promise";
import { config } from "dotenv";
config();

const dev = {
  host: process.env.DEV_HOST,
  user: process.env.DEV_USER,
  password: process.env.DEV_PASS,
  port: process.env.DEV_PORT,
  database: process.env.DEV_BD,
};

const prod = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASS,
  port: process.env.PORT,
  database: process.env.BD,
};

export const pool = createPool({
  host: prod.host,
  user: prod.user,
  password: prod.password,
  port: prod.port,
  database: prod.database,
});
