import sql from "mssql";

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("MSSQL connected");
    return pool;
  })
  .catch((err) => console.log("DB Error:", err));