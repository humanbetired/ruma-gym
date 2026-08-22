import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 rounded-lg neu-flat-sm flex items-center justify-center text-text-secondary hover:text-text-primary hover:brightness-110 disabled:opacity-30 disabled:pointer-events-none transition-all"
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft size={16} />
      </button>

      {pageNumbers.map((num, idx) =>
        num === '...' ? (
          <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-text-secondary text-sm">
            ...
          </span>
        ) : (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
              num === page ? 'neu-pressed text-secondary' : 'neu-flat-sm text-text-secondary hover:text-text-primary hover:brightness-110'
            }`}
          >
            {num}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="w-9 h-9 rounded-lg neu-flat-sm flex items-center justify-center text-text-secondary hover:text-text-primary hover:brightness-110 disabled:opacity-30 disabled:pointer-events-none transition-all"
        aria-label="Halaman berikutnya"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  const delta = 1;
  const range: (number | '...')[] = [];

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    } else if (range[range.length - 1] !== '...') {
      range.push('...');
    }
  }

  return range;
}