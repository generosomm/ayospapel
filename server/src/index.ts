import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = await createApp();

try {
  await app.listen({ port: env.PORT, host: "127.0.0.1" });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
