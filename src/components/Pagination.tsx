import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

export default function Pagination({ currentPage, totalPages, basePath, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  };

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav className="flex justify-center items-center gap-2 mt-10">
      {currentPage > 1 && (
        <Link href={buildHref(currentPage - 1)} className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">Previous</Link>
      )}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-gray-400">…</span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            className={`w-9 h-9 flex items-center justify-center text-sm rounded-lg border ${
              p === currentPage ? "bg-pink-600 text-white border-pink-600" : "hover:bg-gray-50 border-gray-200"
            }`}
          >{p}</Link>
        )
      )}
      {currentPage < totalPages && (
        <Link href={buildHref(currentPage + 1)} className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">Next</Link>
      )}
    </nav>
  );
}
