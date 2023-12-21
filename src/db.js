import { createPool } from "mysql2/promise";

export const pool = createPool({
    host: 'db-solutio.cvuagilm4qak.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'leica666',
    port: '3306',
    database: 'Solutio'
});
