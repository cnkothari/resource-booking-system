import { PaginationMeta } from '../types';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

const Pagination = ({ pagination, onPageChange }: PaginationProps) => {
  const { page, totalPages, total, limit } = pagination;
  if (total === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium">{start}</span>–<span className="font-medium">{end}</span>{' '}
        of <span className="font-medium">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="btn-secondary px-3 py-1"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <span className="px-3 text-sm text-slate-600">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className="btn-secondary px-3 py-1"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
