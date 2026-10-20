import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { PendingAttachment } from "../models/domain.js";
import { HttpError } from "../utils/http-error.js";

const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);

function hasExpectedSignature(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === "application/pdf") return buffer.subarray(0, 5).toString() === "%PDF-";
  if (mimeType === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    );
  }
  return false;
}

function safeOriginalFilename(filename: string): string {
  return path
    .basename(filename)
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .slice(0, 180);
}

export class LocalStorage {
  constructor(private readonly directory: string) {}

  async save(
    originalFilename: string,
    mimeType: string,
    buffer: Buffer
  ): Promise<PendingAttachment> {
    if (!allowedTypes.has(mimeType)) {
      throw new HttpError(
        400,
        "Only PDF, JPEG, and PNG files are allowed in the pilot.",
        "UNSUPPORTED_FILE_TYPE"
      );
    }
    if (buffer.length === 0 || buffer.length > 15 * 1024 * 1024) {
      throw new HttpError(
        400,
        "Each file must be between 1 byte and 15 MB.",
        "INVALID_FILE_SIZE"
      );
    }
    if (!hasExpectedSignature(buffer, mimeType)) {
      throw new HttpError(
        400,
        "A file did not match its declared PDF or image type.",
        "INVALID_FILE_CONTENT"
      );
    }
    const id = randomUUID();
    const extension =
      mimeType === "application/pdf"
        ? ".pdf"
        : mimeType === "image/png"
          ? ".png"
          : ".jpg";
    const storageKey = `${id}${extension}`;
    await fs.mkdir(this.directory, { recursive: true });
    await fs.writeFile(path.join(this.directory, storageKey), buffer, { flag: "wx" });
    return {
      id,
      originalFilename: safeOriginalFilename(originalFilename) || `document${extension}`,
      storageKey,
      mimeType,
      sizeBytes: buffer.length
    };
  }

  async remove(storageKey: string): Promise<void> {
    await fs.rm(path.join(this.directory, path.basename(storageKey)), { force: true });
  }

  open(storageKey: string) {
    return createReadStream(path.join(this.directory, path.basename(storageKey)));
  }
}
