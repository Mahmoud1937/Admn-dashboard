const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

export default function Pagination({
  pageNumber,
  totalPages,
  totalCount,
  pageSize,
  itemLabel = "items",
  onGoToPage,
  onPageSizeChange,
  getPageNumbers,
}) {
  if (totalCount < 20) return null;
  const pageNumbers = getPageNumbers(pageNumber, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <p className="text-xs text-slate-400">
          Showing page {pageNumber} of {totalPages} ({totalCount} {itemLabel})
        </p>

        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-xs text-slate-400">
            Rows per page
          </label>
          <select
            id="pageSize"
            value={pageSize ?? ""}
            onChange={onPageSizeChange}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            {pageSize && !PAGE_SIZE_OPTIONS.includes(pageSize) && (
              <option value={pageSize}>{pageSize}</option>
            )}
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1 md:justify-end">
        <button
          onClick={() => onGoToPage(pageNumber - 1)}
          disabled={pageNumber <= 1}
          className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
        >
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">‹</span>
        </button>

        {pageNumbers[0] > 1 && (
          <>
            <button
              onClick={() => onGoToPage(1)}
              className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50 xs:inline-flex"
            >
              1
            </button>
            {pageNumbers[0] > 2 && (
              <span className="hidden px-1 text-slate-300 xs:inline">…</span>
            )}
          </>
        )}

        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onGoToPage(page)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              page === pageNumber
                ? "bg-blue-900 text-white"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {page}
          </button>
        ))}

        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="hidden px-1 text-slate-300 xs:inline">…</span>
            )}
            <button
              onClick={() => onGoToPage(totalPages)}
              className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50 xs:inline-flex"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onGoToPage(pageNumber + 1)}
          disabled={pageNumber >= totalPages}
          className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">›</span>
        </button>
      </div>
    </div>
  );
}