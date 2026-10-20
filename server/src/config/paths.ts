import { fileURLToPath } from "node:url";
import path from "node:path";

export const projectRoot = path.resolve(
  fileURLToPath(new URL("../../../", import.meta.url))
);

export function fromProjectRoot(...segments: string[]): string {
  return path.join(projectRoot, ...segments);
}
