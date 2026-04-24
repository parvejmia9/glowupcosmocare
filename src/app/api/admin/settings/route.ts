import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const keys = ["about_text", "delivery_charge_inside", "delivery_charge_outside", "featured_product_ids"];
  const settings = await prisma.siteSetting.findMany({ where: { key: { in: keys } } });
  const result: Record<string, string> = {};
  for (const s of settings) {
    result[s.key] = s.value;
  }
  return NextResponse.json({ settings: result });
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const allowedKeys = ["about_text", "delivery_charge_inside", "delivery_charge_outside", "featured_product_ids"];

    for (const [key, value] of Object.entries(body)) {
      if (!allowedKeys.includes(key)) continue;
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    return NextResponse.json({ message: "Settings updated" });
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
