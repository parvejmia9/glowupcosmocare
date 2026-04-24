import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

const isDev = process.env.NODE_ENV !== "production";

function getR2Client() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { AwsClient } = require("aws4fetch") as typeof import("aws4fetch");
  return new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  });
}

function r2Endpoint() {
  return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}`;
}

const R2_PREFIX = "glowupcosmocare/uploads/";

async function r2Upload(key: string, buffer: Buffer, contentType: string): Promise<string> {
  const fullKey = `${R2_PREFIX}${key}`;
  const url = `${r2Endpoint()}/${fullKey}`;
  const res = await getR2Client().fetch(url, {
    method: "PUT",
    headers: { "Content-Type": contentType, "Content-Length": String(buffer.length) },
    body: new Uint8Array(buffer),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`R2 upload failed: ${res.status} ${text}`);
  }
  return `${process.env.R2_PUBLIC_URL}/${fullKey}`;
}

async function r2Delete(key: string): Promise<void> {
  const fullKey = `${R2_PREFIX}${key}`;
  const url = `${r2Endpoint()}/${fullKey}`;
  await getR2Client().fetch(url, { method: "DELETE" });
}

async function localUpload(key: string, buffer: Buffer): Promise<string> {
  const filePath = path.join(process.cwd(), "public", "uploads", key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
  return `/uploads/${key}`;
}

async function localDelete(key: string): Promise<void> {
  const filePath = path.join(process.cwd(), "public", "uploads", key);
  try { await unlink(filePath); } catch {}
}

export async function uploadToR2(key: string, buffer: Buffer, contentType: string): Promise<string> {
  if (isDev) return localUpload(key, buffer);
  return r2Upload(key, buffer, contentType);
}

export async function deleteFromR2(key: string): Promise<void> {
  if (isDev) return localDelete(key);
  return r2Delete(key);
}

export function getKeyFromUrl(publicUrl: string): string {
  if (publicUrl.startsWith("/uploads/")) {
    return publicUrl.replace("/uploads/", "");
  }
  return publicUrl.replace(`${process.env.R2_PUBLIC_URL}/${R2_PREFIX}`, "");
}
