import TableActionsCell from "../../../shared/components/TableActionsCell";
import { useState } from 'react'
import useFilterPanel from '../../../shared/hooks/useFilterPanel'
import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { useServerPagination } from '../../../shared/hooks/useServerPagination'
import { useOrderHistoryQuery } from '../hooks/useOrderHistoryQuery'
import { useInvoiceDetailsQuery } from '../hooks/useInvoiceDetailsQuery'
import SearchBarWithFilters from '../../../shared/components/SearchBarWithFilters'
import FilterPanel from '../../../shared/components/FilterPanel'
import FilterPanelHeader from '../../../shared/components/FilterPanelHeader'
import ProviderSelect from '../../../shared/components/ProviderSelect'
import DateRangeFilterFields from '../../../shared/components/DateRangeFilterFields'
import FilterPanelFooter from '../../../shared/components/FilterPanelFooter'
import QueryErrorState from '../../../shared/components/QueryErrorState'
import TableEmptyState from '../../../shared/components/TableEmptyState'
import ScrollableTable from '../../../shared/components/ScrollableTable'
import StatusBadge from '../../../shared/components/StatusBadge'
import { formatDate } from '../../../utils/formatDate'
import Pagination from '../../../shared/components/Pagination'
import InvoiceDetailsModal from './InvoiceDetailsModal'
import { SkeletonTable } from "../../../shared/components/Skeleton";
import useLanguage from "../../../localization/useLanguage";
import useClientsText from "../../../localization/useClientsText";

const ORDER_STATUS_TONE = {
  Paid: 'primary',
  Pending: 'warning',
  Canceled: 'danger',
  Used: 'emerald',
}

/* Backend enum:
   Paid = 1, Pending = 2, Canceled = 3, Used = 4
*/
const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 1, label: 'Paid' },
  { value: 2, label: 'Pending' },
  { value: 3, label: 'Canceled' },
  { value: 4, label: 'Used' },
]

const DEFAULT_FILTERS = {
  providerId: '',
  status: '',
  fromDate: '',
  toDate: '',
}

export default function OrderHistorySection({ userId }) {
  const t = useClientsText();
  const { language, direction } = useLanguage();
  const rtl = direction === "rtl";
  const {
    isOpen: isFiltersOpen,
    filters,
    draft,
    setDraft,
    panelRef,
    triggerRef,
    toggle: handleOpenFilters,
    close: handleCloseFilters,
    apply: handleApplyFilters,
    clear: handleClearFilters,
  } = useFilterPanel({ emptyFilters: DEFAULT_FILTERS })

  const set = (field) => (e) =>
    setDraft((prev) => ({ ...prev, [field]: e.target.value }))

  const resetKey = JSON.stringify(filters)
  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination ({ resetKey })

  const { data, isLoading, isError, error, refetch } = useOrderHistoryQuery(
    userId,
    { ...filters, pageNumber, pageSize },
    true,
    language,
  )

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null)

  const { data: invoiceDetails, isLoading: isInvoiceLoading, error: invoiceError, refetch: refetchInvoice } =
    useInvoiceDetailsQuery(selectedInvoiceId, !!selectedInvoiceId, language)

  const items = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== null && value !== undefined && value !== '',
  ).length

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="relative">
        <SearchBarWithFilters
          onFilterClick={handleOpenFilters}
          activeFilterCount={activeFiltersCount}
          filterButtonRef={triggerRef}
          alignEnd
          filterLabel={t("Filters")}
          rtl={rtl}
        />

        {isFiltersOpen && (
          <FilterPanel
            panelRef={panelRef}
            onClose={handleCloseFilters}
            className="sm:w-80"
            side={rtl ? "left" : "right"}
          >
            <FilterPanelHeader title={t("Filters")} closeLabel={t("Close filters")} onClose={handleCloseFilters} />

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-slate-500">
                {t("Provider")}
              </label>
              <ProviderSelect
                key={language}
                value={draft.providerId}
                onChange={(value) =>
                  setDraft((prev) => ({ ...prev, providerId: value }))
                }
                queryKey={["providers", "lookup", language]}
                placeholder={t("All providers")}
                searchPlaceholder={t("Search providers...")}
                rtl={rtl}
                getOptionLabel={(item) => (rtl ? [item.arName, item.enName] : [item.enName, item.arName]).filter(Boolean).join(" - ")}
                labels={{
                  loading: t("Loading..."),
                  loadingMore: t("Loading more..."),
                  unableToLoadOptions: t("Unable to load options."),
                  tryAgain: t("Try again"),
                  noResults: t("No results found."),
                  clearSelection: t("Clear selection"),
                  openOptions: t("Open options"),
                  closeOptions: t("Close options"),
                }}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-slate-500">
                {t("Status")}
              </label>
              <select
                value={draft.status}
                onChange={set('status')}
                className="mb-5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
              >
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <option key={status.label} value={status.value}>
                    {t(status.label)}
                  </option>
                ))}
              </select>
            </div>

            <DateRangeFilterFields
              draft={draft}
              onDraftChange={setDraft}
              stacked
                locale={language}
                fromLabel={t("From date")}
                toLabel={t("To date")}
                weekdayLabels={["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(t)}
                datePlaceholder={t("dd/mm/yyyy")}
                previousMonthLabel={t("Previous month")}
                nextMonthLabel={t("Next month")}
                toggleCalendarLabel={t("Toggle calendar")}
            />

            <div className="mt-5">
              <FilterPanelFooter
                onClear={handleClearFilters}
                onApply={handleApplyFilters}
                clearLabel={t("Clear all")}
                applyLabel={t("Apply")}
              />
            </div>
          </FilterPanel>
        )}
      </div>

      {isLoading ? (
        <SkeletonTable label={t("Loading order history...")} columns={6} />
      ) : isError ? (
        <QueryErrorState
          title={t("Unable to load order history")}
          error={error}
          onRetry={refetch}
          loadErrorMessage={t("We couldn't load the data. Please try again.")}
          connectionErrorMessage={t("We couldn't connect to the server. Please check your internet connection and try again.")}
          retryLabel={t("Try Again")}
        />
      ) : !items.length ? (
        <TableEmptyState
          icon={faClockRotateLeft}
          title={t("No orders found")}
          hasActiveFilters={activeFiltersCount > 0}
          emptyMessage={t("This client has no order history yet.")}
          filterMessage={t("Try a different search term.")}
        />
      ) : (
        <>
          <ScrollableTable maxHeight="60vh">
            <table className={`w-full min-w-[900px] text-sm ${rtl ? "text-right" : "text-left"}`}>
              <thead className="bg-slate-100">
                <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">{t("Invoice ID")}</th>
                  <th className="px-4 py-3">{t("Provider")}</th>
                  <th className="px-4 py-3 text-center">{t("Status")}</th>
                  <th className="px-4 py-3 text-center">{t("Date")}</th>
                  <th className="px-4 py-3 text-center">{t("Total")}</th>
                  <TableActionsCell as="th" side={rtl ? "left" : "right"} className="px-4 py-3 text-center">{t("Actions")}</TableActionsCell>
                </tr>
              </thead>
              <tbody>
                {items.map((order) => (
                  <tr
                    key={order.invoiceId}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="px-4 py-3 text-slate-700">
                      #{order.invoiceId}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">{rtl ? (order.providerNameAr || order.providerNameEn) : order.providerNameEn}</p>
                      <p className="text-xs text-slate-400">
                        {rtl ? order.providerNameEn : order.providerNameAr}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge
                        tone={ORDER_STATUS_TONE[order.status] || 'neutral'}
                      >
                        {order.status || '-'}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500">
                      {formatDate (order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      <span dir="ltr" className="inline-block">{Number(order.totalAfter ?? 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} EGP</span>
                    </td>
                    <TableActionsCell side={rtl ? "left" : "right"} hoverColor="transparent" className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedInvoiceId(order.invoiceId)}
                        className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                      >
                        {t("View Details")}
                      </button>
                    </TableActionsCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollableTable>

          <Pagination
            pageNumber={pageNumber}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            summary={t("Showing page {{page}} of {{totalPages}} ({{count}} orders)", { page: pageNumber, totalPages, count: totalCount })}
            rowsPerPageLabel={t("Rows per page")}
            previousLabel={t("Previous")}
            nextLabel={t("Next")}
            rtl={rtl}
            onGoToPage={(page) => goToPage(page, totalPages)}
            onPageSizeChange={handlePageSizeChange}
            getPageNumbers={getPageNumbers}
          />
        </>
      )}

      <InvoiceDetailsModal
        isOpen={!!selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
        invoice={invoiceDetails}
        isLoading={isInvoiceLoading}
        error={invoiceError}
        onRetry={refetchInvoice}
      />
    </div>
  )
}
