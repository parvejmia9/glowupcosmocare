import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const inside = await prisma.siteSetting.findUnique({ where: { key: "delivery_charge_inside" } });
  const outside = await prisma.siteSetting.findUnique({ where: { key: "delivery_charge_outside" } });
  return NextResponse.json({
    inside_dhaka: inside ? parseFloat(inside.value) || 70 : 70,
    outside_dhaka: outside ? parseFloat(outside.value) || 120 : 120,
  });
}
