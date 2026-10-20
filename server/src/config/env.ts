import path from "node:path";
import { config } from "dotenv";
import { z } from "zod";
import { fromProjectRoot } from "./paths.js";

config({ path: fromProjectRoot(".env") });

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  DATABASE_PATH: z.string().default("./database/ayospapel.local.sqlite"),
  UPLOAD_PATH: z.string().default("./server/uploads/local"),
  SESSION_COOKIE_NAME: z.string().min(1).default("ayospapel_session"),
  SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(24).default(8),
  CLIENT_ORIGIN: z.url().default("http://localhost:5173")
});

const parsed = schema.parse(process.env);

export const env = {
  ...parsed,
  DATABASE_PATH: path.isAbsolute(parsed.DATABASE_PATH)
    ? parsed.DATABASE_PATH
    : fromProjectRoot(parsed.DATABASE_PATH),
  UPLOAD_PATH: path.isAbsolute(parsed.UPLOAD_PATH)
    ? parsed.UPLOAD_PATH
    : fromProjectRoot(parsed.UPLOAD_PATH)
};
