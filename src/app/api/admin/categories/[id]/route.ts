import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { name, slug, sort_order } = body;

    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        name,
        slug: slug || slugify(name),
        sortOrder: sort_order ?? 0,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.category.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
