import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const resolvePath = (value, fallback) =>
  value ? path.resolve(rootDir, value) : fallback;

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number.parseInt(process.env.PORT ?? "4000", 10),
  logLevel: process.env.LOG_LEVEL ?? "dev",
  dbPath: resolvePath(process.env.DB_PATH, path.resolve(rootDir, "data.sqlite")),
};
