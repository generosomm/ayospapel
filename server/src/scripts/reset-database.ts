import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { env } from "../config/env.js";
import { fromProjectRoot } from "../config/paths.js";
import { seedSyntheticData } from "./seed.js";

const databasePath = path.resolve(env.DATABASE_PATH);
const allowedDirectory = path.resolve(fromProjectRoot("database"));
const isAllowed =
  databasePath.startsWith(`${allowedDirectory}${path.sep}`) &&
  databasePath.endsWith(".local.sqlite");

if (!isAllowed) {
  throw new Error(
    `Refusing to reset database outside ${allowedDirectory} or without .local.sqlite suffix.`
  );
}

fs.rmSync(databasePath, { force: true });
const db = new DatabaseSync(databasePath);
try {
  db.exec(fs.readFileSync(fromProjectRoot("database", "schema.sql"), "utf8"));
  seedSyntheticData(db);
} finally {
  db.close();
}

process.stdout.write(`Synthetic database created at ${databasePath}\n`);
