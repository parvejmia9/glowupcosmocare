import { prisma } from "@/lib/db";
import NewProductClient from "./client";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return <NewProductClient categories={categories.map(c => ({ id: c.id, name: c.name }))} />;
}
