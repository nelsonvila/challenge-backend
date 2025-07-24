import sql from "mssql";
import logger from "../utils/logger";

const config: sql.config = {
  user: process.env.DB_USER || "",
  password: process.env.DB_PASS || "",
  server: process.env.DB_HOST || "",
  database: process.env.DB_NAME || "",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export let pool: sql.ConnectionPool;

export async function initDb(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      logger.info(`Configuring DB connection with: ${JSON.stringify(config)}`);
      pool = await sql.connect(config);
      logger.info("DB connection established successfully");
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      logger.error(`DB connection failed, error: ${err}`);
      logger.info(`DB connection failed, retrying in ${delay}ms...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}
