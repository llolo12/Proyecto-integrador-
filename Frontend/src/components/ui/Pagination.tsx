import { ChevronLeft, ChevronRight } from 'lucide-react';
interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}
export default function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : page * pageSize + 1;
  const end = Math.min(total, (page + 1) * pageSize);
  return (
    <div className="flex items-center justify-between border-t border-pv-sand px-4 py-3 text-sm text-pv-gray">
      <span>
        {total === 0 ? 'Sin resultados' : `${start}${'\u2013'}${end} de ${total}`}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="rounded-lg border border-pv-sand p-1.5 hover:bg-pv-sand disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          aria-label="Anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-[4rem] text-center">
          {page + 1} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page + 1 >= totalPages}
          className="rounded-lg border border-pv-sand p-1.5 hover:bg-pv-sand disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          aria-label="Siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
