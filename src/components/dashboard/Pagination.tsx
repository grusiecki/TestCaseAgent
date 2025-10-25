import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

interface PaginationProps extends PaginationOptions {
  onPageChange: (page: number) => void;
}

export function Pagination({ page, limit, total, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.tagName === "INPUT") {
        return; // Don't handle keyboard navigation when focus is in an input
      }

      if (e.key === "ArrowLeft" && canGoPrevious) {
        onPageChange(page - 1);
      } else if (e.key === "ArrowRight" && canGoNext) {
        onPageChange(page + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [page, canGoPrevious, canGoNext, onPageChange]);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (page > 3) {
        pages.push("...");
      }
      
      // Show current page and surrounding pages
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      
      if (page < totalPages - 2) {
        pages.push("...");
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className="flex justify-center items-center space-x-2"
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => canGoPrevious && onPageChange(page - 1)}
        disabled={!canGoPrevious}
        aria-label="Previous page"
        aria-disabled={!canGoPrevious}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center space-x-2" role="group" aria-label="Page numbers">
        {getPageNumbers().map((pageNum, index) => (
          pageNum === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-muted-foreground"
              aria-hidden="true"
            >
              ...
            </span>
          ) : (
            <Button
              key={pageNum}
              variant={pageNum === page ? "default" : "outline"}
              size="sm"
              onClick={() => pageNum !== page && onPageChange(pageNum as number)}
              aria-current={pageNum === page ? "page" : undefined}
              aria-label={`Page ${pageNum}`}
            >
              {pageNum}
            </Button>
          )
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => canGoNext && onPageChange(page + 1)}
        disabled={!canGoNext}
        aria-label="Next page"
        aria-disabled={!canGoNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="sr-only" aria-live="polite">
        Page {page} of {totalPages}
      </div>
    </nav>
  );
}