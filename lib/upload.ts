import { put } from "@vercel/blob";
import crypto from "crypto";

const MAGIC: Record<string, number[]> = {
  jpg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
  gif: [0x47, 0x49, 0x46, 0x38],
  webp: [0x52, 0x49, 0x46, 0x46],
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

function detectType(buffer: Buffer): string | null {
  for (const [ext, sig] of Object.entries(MAGIC)) {
    if (sig.every((b, i) => buffer[i] === b)) return ext;
  }
  return null;
}

export async function saveUpload(file: File, maxSize: number = 5 * 1024 * 1024): Promise<{ url: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Unsupported format");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > maxSize) {
    throw new Error(`File too large (max ${maxSize / 1024 / 1024}MB)`);
  }

  const ext = detectType(buffer);
  if (!ext) {
    throw new Error("Invalid file content");
  }

  const filename = `${crypto.randomUUID()}.${ext}`;

  const blob = await put(filename, buffer, {
    access: "public",
    contentType: file.type,
    addRandomSuffix: false,
  });

  return { url: blob.url };
}
