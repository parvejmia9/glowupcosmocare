import StorefrontShell from "@/components/StorefrontShell";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return <StorefrontShell categories={categories}>{children}</StorefrontShell>;
}
