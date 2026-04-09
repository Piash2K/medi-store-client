"use client";

import { Button } from "@/components/ui/button";

type TablePaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const getPageItems = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);

  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }

  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  }

  return [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
};

export default function TablePagination({ currentPage, totalPages, onPageChange }: TablePaginationProps) {
  const normalizedTotalPages = Math.max(1, totalPages);
  const pageItems = getPageItems(currentPage, normalizedTotalPages);

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 border-t px-3 py-3 sm:px-4">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="h-8 px-2 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
      >
        Prev
      </Button>

      {pageItems.map((page, index) => {
        const previousPage = pageItems[index - 1];
        const showEllipsis = typeof previousPage === "number" && page - previousPage > 1;

        return (
          <div key={page} className="flex items-center gap-1.5">
            {showEllipsis ? (
              <span className="inline-flex h-8 min-w-8 items-center justify-center px-1 text-sm text-emerald-600/80 dark:text-emerald-400/80">
                ...
              </span>
            ) : null}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page)}
              className={`h-8 min-w-8 px-2 text-sm ${
                currentPage === page
                  ? "text-emerald-700 underline decoration-2 underline-offset-6 dark:text-emerald-300"
                  : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300"
              }`}
            >
              {page}
            </Button>
          </div>
        );
      })}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(Math.min(currentPage + 1, normalizedTotalPages))}
        disabled={currentPage === normalizedTotalPages}
        className="h-8 px-2 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
      >
        Next
      </Button>
    </div>
  );
}
