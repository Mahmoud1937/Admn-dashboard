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
  if (totalCount < 10) return null;
  const pageNumbers = getPageNumbers(pageNumber, totalPages);

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
      <div className="flex items-center gap-4">
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

      <div className="flex items-center gap-1">
        <button
          onClick={() => onGoToPage(pageNumber - 1)}
          disabled={pageNumber <= 1}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        {pageNumbers[0] > 1 && (
          <>
            <button
              onClick={() => onGoToPage(1)}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50"
            >
              1
            </button>
            {pageNumbers[0] > 2 && <span className="px-1 text-slate-300">…</span>}
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
              <span className="px-1 text-slate-300">…</span>
            )}
            <button
              onClick={() => onGoToPage(totalPages)}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onGoToPage(pageNumber + 1)}
          disabled={pageNumber >= totalPages}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}