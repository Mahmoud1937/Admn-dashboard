import { useState } from 'react'
import useFilterPanel from '../../../shared/hooks/useFilterPanel'
import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { useServerPagination } from '../../../shared/hooks/useServerPagination'
import { useOrderHistoryQuery } from '../hooks/useOrderHistoryQuery'
import { useInvoiceDetailsQuery } from '../hooks/useInvoiceDetailsQuery'
import SearchBarWithFilters from '../../../shared/components/SearchBarWithFilters'
import FilterPanel from '../../../shared/components/FilterPanel'
import FilterPanelHeader from '../../../shared/components/FilterPanelHeader'
import ProviderSelect from './Providerselect'
import DateRangeFilterFields from '../../../shared/components/DateRangeFilterFields'
import FilterPanelFooter from '../../../shared/components/FilterPanelFooter'
import QueryErrorState from '../../../shared/components/QueryErrorState'
import TableEmptyState from '../../../shared/components/TableEmptyState'
import StatusBadge from '../../../shared/components/StatusBadge'
import { formatDate } from '../../../utils/formatDate'
import Pagination from '../../../shared/components/Pagination'
import InvoiceDetailsModal from './InvoiceDetailsModal'

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
  )

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null)

  const { data: invoiceDetails, isLoading: isInvoiceLoading } =
    useInvoiceDetailsQuery(selectedInvoiceId, !!selectedInvoiceId)

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
        />

        {isFiltersOpen && (
          <FilterPanel
            panelRef={panelRef}
            onClose={handleCloseFilters}
            className="sm:w-80"
          >
            <FilterPanelHeader onClose={handleCloseFilters} />

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-slate-500">
                Provider
              </label>
              <ProviderSelect
                value={draft.providerId}
                onChange={(value) =>
                  setDraft((prev) => ({ ...prev, providerId: value }))
                }
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
                onChange={set('status')}
                className="mb-5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
              >
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <option key={status.label} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <DateRangeFilterFields
              draft={draft}
              onDraftChange={setDraft}
              stacked
            />

            <div className="mt-5">
              <FilterPanelFooter
                onClear={handleClearFilters}
                onApply={handleApplyFilters}
              />
            </div>
          </FilterPanel>
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
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">Invoice ID</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Date</th>
                  <th className="px-4 py-3 text-center">Total</th>
                  <th className="px-4 py-3 text-center">Actions</th>
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
                      <p className="text-slate-700">{order.providerNameEn}</p>
                      <p className="text-xs text-slate-400">
                        {order.providerNameAr}
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
                      {Number(order.totalAfter ?? 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      EGP
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedInvoiceId(order.invoiceId)}
                        className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                      >
                        View Details
                      </button>
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

      <InvoiceDetailsModal
        isOpen={!!selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
        invoice={invoiceDetails}
        isLoading={isInvoiceLoading}
      />
    </div>
  )
}