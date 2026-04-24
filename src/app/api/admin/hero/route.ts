import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { uploadToR2, deleteFromR2, getKeyFromUrl } from "@/lib/r2";
import path from "path";

const MAX_SIZE = 10 * 1024 * 1024;

export async function GET() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["hero_image_1", "hero_image_2", "hero_image_3"] } },
  });
  const heroImages: Record<string, string> = {};
  for (const s of settings) {
    heroImages[s.key] = s.value;
  }
  return NextResponse.json({ heroImages });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const slot = formData.get("slot") as string;
    const file = formData.get("hero") as File;

    if (!slot || !["1", "2", "3"].includes(slot)) {
      return NextResponse.json({ error: "Invalid slot (1, 2, or 3)" }, { status: 400 });
    }

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const key = `hero_image_${slot}`;

    // Delete old hero from R2 if exists
    const existing = await prisma.siteSetting.findUnique({ where: { key } });
    if (existing && !existing.value.startsWith("/placeholder")) {
      try { await deleteFromR2(getKeyFromUrl(existing.value)); } catch {}
    }

    const storageKey = `hero/hero_${slot}_${Date.now()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || "image/jpeg";
    const publicUrl = await uploadToR2(storageKey, buffer, contentType);

    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: publicUrl },
      create: { key, value: publicUrl },
    });

    return NextResponse.json({ key, url: publicUrl });
  } catch (error) {
    console.error("Hero upload error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
