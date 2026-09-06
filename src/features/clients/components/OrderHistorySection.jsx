import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faFilter, faXmark } from "@fortawesome/free-solid-svg-icons";

import { useOrderHistoryQuery } from "../hooks/useOrderHistoryQuery";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import ProviderSelect from "./Providerselect";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import Pagination from "../../../shared/components/Pagination";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "-";

const ORDER_STATUS_STYLES = {
  Paid: "bg-blue-50 text-blue-700",
  Pending: "bg-amber-50 text-amber-700",
  Canceled: "bg-red-50 text-red-700",
  Used: "bg-emerald-50 text-emerald-700",
};

const OrderStatusBadge = ({ status }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
      ORDER_STATUS_STYLES[status] || "bg-slate-100 text-slate-600"
    }`}
  >
    {status || "-"}
  </span>
);

/* Backend enum:
   Paid = 1, Pending = 2, Canceled = 3, Used = 4
*/
const ORDER_STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: 1, label: "Paid" },
  { value: 2, label: "Pending" },
  { value: 3, label: "Canceled" },
  { value: 4, label: "Used" },
];

const DEFAULT_FILTERS = {
  providerId: "",
  status: "",
  fromDate: "",
  toDate: "",
};

const OrderHistoryFiltersPanel = ({
  draft,
  onChange,
  onApply,
  onClear,
  onClose,
  panelRef,
}) => {
  const set = (field) => (e) => {
    onChange((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-20 bg-slate-900/30 sm:hidden"
      />

      <div
        ref={panelRef}
        className="
          fixed inset-x-0 bottom-0 z-30 max-h-[85vh] w-full overflow-y-auto
          rounded-t-2xl border border-slate-200 bg-white p-5 shadow-lg
          sm:absolute sm:inset-x-auto sm:right-4 sm:top-full sm:bottom-auto
          sm:z-20 sm:mt-2 sm:max-h-none sm:w-80 sm:rounded-xl sm:bg-white/95
          sm:backdrop-blur-sm
        "
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Filters</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Provider
          </label>
          <ProviderSelect
            value={draft.providerId}
            onChange={(value) => onChange((prev) => ({ ...prev, providerId: value }))}
            placeholder="All providers"
            className="w-full"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Status
          </label>
          <select
            value={draft.status}
            onChange={set("status")}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
          >
            {ORDER_STATUS_OPTIONS.map((status) => (
              <option key={status.label} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            From date
          </label>
          <input
            type="date"
            value={draft.fromDate}
            onChange={set("fromDate")}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            To date
          </label>
          <input
            type="date"
            value={draft.toDate}
            onChange={set("toDate")}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onApply}
            className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
};

const OrderHistorySearchBar = ({
  onFilterClick,
  activeFilterCount = 0,
  filterButtonRef,
}) => (
  <div className="flex items-center justify-end gap-3 border-b border-slate-200 p-4">
    <button
      ref={filterButtonRef}
      type="button"
      onClick={onFilterClick}
      className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      <FontAwesomeIcon icon={faFilter} />
      <span>Filters</span>
      {activeFilterCount > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs text-white">
          {activeFilterCount}
        </span>
      )}
    </button>
  </div>
);

export default function OrderHistorySection({ userId }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draft, setDraft] = useState(DEFAULT_FILTERS);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  const resetKey = JSON.stringify(filters);
  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination({ resetKey });

  const { data, isLoading, isError, error, refetch } = useOrderHistoryQuery(
    userId,
    { ...filters, pageNumber, pageSize },
    true
  );

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleOpenFilters = () => {
    setDraft(filters);
    setIsFiltersOpen((prev) => !prev);
  };

  const handleApplyFilters = () => {
    setFilters(draft);
    setIsFiltersOpen(false);
  };

  const handleClearFilters = () => {
    setDraft(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setIsFiltersOpen(false);
  };

  const handleCloseFilters = () => setIsFiltersOpen(false);

  useEffect(() => {
    if (!isFiltersOpen) return;

    const handleClickOutside = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setIsFiltersOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFiltersOpen]);

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== null && value !== undefined && value !== ""
  ).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="relative">
        <OrderHistorySearchBar
          onFilterClick={handleOpenFilters}
          activeFilterCount={activeFiltersCount}
          filterButtonRef={triggerRef}
        />

        {isFiltersOpen && (
          <OrderHistoryFiltersPanel
            draft={draft}
            onChange={setDraft}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
            onClose={handleCloseFilters}
            panelRef={panelRef}
          />
        )}
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-sm text-slate-400">
          Loading order history...
        </div>
      ) : isError ? (
        <QueryErrorState
          title="Unable to load order history"
          error={error}
          onRetry={refetch}
        />
      ) : !items.length ? (
        <TableEmptyState
          icon={faClockRotateLeft}
          title="No orders found"
          hasActiveFilters={activeFiltersCount > 0}
          emptyMessage="This client has no order history yet."
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Date</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((order) => (
                  <tr
                    key={order.invoiceId}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="px-4 py-3 text-slate-700">#{order.invoiceId}</td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">{order.providerNameEn}</p>
                      <p className="text-xs text-slate-400">{order.providerNameAr}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {Number(order.totalAfter ?? 0).toFixed(2)} EGP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            pageNumber={pageNumber}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            itemLabel="orders"
            onGoToPage={(page) => goToPage(page, totalPages)}
            onPageSizeChange={handlePageSizeChange}
            getPageNumbers={getPageNumbers}
          />
        </>
      )}
    </div>
  );
}
