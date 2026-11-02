import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFileInvoiceDollar,
  faMoneyBillWave,
  faCreditCard,
} from '@fortawesome/free-solid-svg-icons'
import { Eye, History } from 'lucide-react'
import TableEmptyState from '../../../shared/components/TableEmptyState'
import { useInvoiceDetailsQuery } from '../../clients/hooks/useInvoiceDetailsQuery'
import ScrollableTable from '../../../shared/components/ScrollableTable'
import { formatDate } from '../../../utils/formatDate'
import StatusBadge from '../../../shared/components/StatusBadge'
import TimelineModal from './TimelineModal'
import InvoiceDetailsModal from '../../clients/components/InvoiceDetailsModal'
import ClientAvatar from '../../../shared/components/ClientAvatar'
import Skeleton, { SkeletonTable } from "../../../shared/components/Skeleton";

const STATUS_TONE = {
  1: 'success', // Paid
  2: 'warning', // Pending
  3: 'danger', // Canceled
  4: 'success', // Used
}

const formatMoney = (n) => `${Number(n).toFixed(2)} EGP`

const formatTime = (date) => {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function TableSkeleton({ rows = 7 }) {
  return (
    <SkeletonTable
      rows={rows}
      rowClassName="flex items-center gap-5 px-6 py-4"
    >
      <Skeleton className="h-3 w-20 rounded bg-slate-100" />
      <Skeleton className="h-9 w-9 shrink-0 rounded-full bg-slate-100" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-44 rounded bg-slate-100" />
        <Skeleton className="h-3 w-28 rounded bg-slate-100" />
      </div>
      <Skeleton className="hidden h-3 w-32 rounded bg-slate-100 md:block" />
      <Skeleton className="h-3 w-20 rounded bg-slate-100" />
      <Skeleton className="h-6 w-16 rounded-full bg-slate-100" />
    </SkeletonTable>
  )
}

function IconButton({ title, onClick, tone = 'blue', children }) {
  const tones = {
    blue: 'hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-blue-300',
    green:
      'hover:bg-emerald-50 hover:text-emerald-600 focus-visible:ring-emerald-300',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors focus:outline-none focus-visible:ring-2 ${tones[tone]}`}
    >
      {children}
    </button>
  )
}

export default function InvoicesTable({
  invoices,
  isLoading,
  hasActiveFilters,
}) {
  const [timelineInvoiceId, setTimelineInvoiceId] = useState(null)
  const [detailsInvoiceId, setDetailsInvoiceId] = useState(null)

  const { data: detailsInvoice, isLoading: detailsLoading } =
    useInvoiceDetailsQuery(detailsInvoiceId, !!detailsInvoiceId)

  if (isLoading) {
    return <TableSkeleton />
  }

  if (!invoices.length) {
    return (
      <TableEmptyState
        icon={faFileInvoiceDollar}
        title="No invoices found"
        hasActiveFilters={hasActiveFilters}
        emptyMessage="There are no invoices to display."
      />
    )
  }

  return (
    <div className="min-w-0">
      <ScrollableTable maxHeight="60vh">
        <table className="w-full min-w-[1280px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100">
            <tr className="border-b border-slate-200 text-xs font-medium text-slate-700">
              <th className="px-6 py-3">Invoice</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Card number</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3 text-right">Before discount</th>
              <th className="px-4 py-3 text-right">After discount</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-center">Services</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => {
              const clientName = inv.familyMemberName || inv.clientName || '-'
              const time = formatTime(inv.date)

              return (
                <tr
                  key={inv.invoiceId}
                  className="transition-colors hover:bg-slate-50"
                >
                  {/* Invoice no + date */}
                  <td className="whitespace-nowrap px-6 py-3.5">
                    <p className="font-semibold tabular-nums text-slate-900">
                      #{inv.invoiceId}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(inv.date)}
                      {time && <span className="text-slate-400"> {time}</span>}
                    </p>
                  </td>

                  {/* Client + phone */}
                  <td className="px-4 py-3.5">
                    <div className="flex max-w-[280px] items-center gap-3">
                      <ClientAvatar
                        name={clientName === '-' ? '' : clientName}
                        colorSeed={inv.clientId || inv.userId || inv.invoiceId}
                        sizeClass="h-9 w-9"
                        textClass="text-[10px] font-semibold"
                      />
                      <div className="min-w-0">
                        <p
                          title={clientName}
                          dir="auto"
                          className="truncate text-left font-medium text-slate-900"
                        >
                          {clientName}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {inv.familyMemberRelation
                            ? `${inv.familyMemberRelation}, `
                            : ''}
                          <span className="tabular-nums">
                            {inv.mobileNumber || 'No phone'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Card */}
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs tabular-nums text-slate-700">
                    {inv.cardNumber || '-'}
                  </td>

                  {/* Provider + branch */}
                  <td className="px-4 py-3.5">
                    <div className="max-w-[230px] leading-tight">
                      <p className="truncate font-medium text-slate-800">
                        {inv.providerNameEn || '-'}
                      </p>
                      {inv.providerNameAr && (
                        <p
                          dir="rtl"
                          lang="ar"
                          style={{ textAlign: 'left' }}
                          className="mt-0.5 truncate text-xs text-slate-500"
                        >
                          {inv.providerNameAr}
                        </p>
                      )}
                      {inv.providerBranchName && (
                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          {inv.providerBranchName}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Payment */}
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      <FontAwesomeIcon
                        icon={inv.isCash ? faMoneyBillWave : faCreditCard}
                        className="text-slate-400"
                      />
                      {inv.isCash ? 'Cash' : 'Visa'}
                    </span>
                  </td>

                  {/* Amounts */}
                  <td className="whitespace-nowrap px-4 py-3.5 text-right tabular-nums text-slate-500">
                    {formatMoney(inv.priceBefore)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right tabular-nums text-slate-600">
                    {formatMoney(inv.priceAfter)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold tabular-nums text-slate-900">
                    {formatMoney(inv.totalAmount)}
                  </td>

                  {/* Services */}
                  <td className="px-4 py-3.5 text-center tabular-nums text-slate-600">
                    {inv.servicesCount}
                  </td>

                  {/* Status */}
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <div className="flex items-center justify-center">
                      <StatusBadge tone={STATUS_TONE[inv.status] ?? 'default'}>
                        {inv.statusName}
                      </StatusBadge>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <IconButton
                        title="View details"
                        onClick={() => setDetailsInvoiceId(inv.invoiceId)}
                      >
                        <Eye size={16} />
                      </IconButton>
                      <IconButton
                        title="View timeline"
                        tone="green"
                        onClick={() => setTimelineInvoiceId(inv.invoiceId)}
                      >
                        <History size={16} />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </ScrollableTable>

      {timelineInvoiceId && (
        <TimelineModal
          orderNo={timelineInvoiceId}
          onClose={() => setTimelineInvoiceId(null)}
        />
      )}

      {detailsInvoiceId && (
        <InvoiceDetailsModal
          isOpen={!!detailsInvoiceId}
          onClose={() => setDetailsInvoiceId(null)}
          invoice={detailsInvoice}
          isLoading={detailsLoading}
        />
      )}
    </div>
  )
}
