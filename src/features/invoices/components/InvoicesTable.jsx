import { useTranslation } from "react-i18next";
import TableActionsCell from "../../../shared/components/TableActionsCell";
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFileInvoiceDollar,
  faMoneyBillWave,
  faCreditCard,
} from '@fortawesome/free-solid-svg-icons'
import { Eye, History, Package as PackageIcon } from 'lucide-react'
import TableEmptyState from '../../../shared/components/TableEmptyState'
import { useInvoiceDetailsQuery } from '../../clients/hooks/useInvoiceDetailsQuery'
import ScrollableTable from '../../../shared/components/ScrollableTable'
import { formatDate } from '../../../utils/formatDate'
import StatusBadge from '../../../shared/components/StatusBadge'
import TimelineModal from './TimelineModal'
import InvoiceDetailsModal from '../../clients/components/InvoiceDetailsModal'
import ClientAvatar from '../../../shared/components/ClientAvatar'
import Skeleton, { SkeletonTable } from '../../../shared/components/Skeleton'

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const STATUS_TONE = {
  1: 'success', // Paid
  2: 'warning', // Pending
  3: 'danger', // Canceled
  4: 'success', // Used
}

const COLUMNS = [
  { key: 'invoice', label: 'Invoice', width: 150, align: 'left', px: 'px-6' },
  { key: 'client', label: 'Client', width: 270, align: 'left' },
  { key: 'provider', label: 'Provider', width: 240, align: 'left' },
  { key: 'type', label: 'Type', width: 130, align: 'left' },
  { key: 'amount', label: 'Amount', width: 200, align: 'right' },
  { key: 'items', label: 'Items', width: 90, align: 'center' },
  { key: 'status', label: 'Status', width: 110, align: 'center' },
]

const ACTIONS_WIDTH = 96
const TABLE_MIN_WIDTH =
  COLUMNS.reduce((sum, c) => sum + c.width, ACTIONS_WIDTH) + 'px'

const ALIGN_CLASS = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

/* -------------------------------------------------------------------------- */
/*                                  Formatters                                */
/* -------------------------------------------------------------------------- */

const formatMoney = (n) =>
  `${Number(n ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EGP`

const formatPercentage = (value) =>
  value == null
    ? null
    : `${Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}%`

const formatTime = (date) => {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

/* -------------------------------------------------------------------------- */
/*                               Small components                             */
/* -------------------------------------------------------------------------- */

function TableSkeleton({ rows = 7 }) {
  return (
    <SkeletonTable
      rows={rows}
      rowClassName="flex items-center gap-5 px-6 py-4"
    >
      <div className="w-28 space-y-2">
        <Skeleton className="h-3 w-20 rounded bg-slate-100" />
        <Skeleton className="h-3 w-24 rounded bg-slate-100" />
      </div>
      <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-slate-100" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-44 rounded bg-slate-100" />
        <Skeleton className="h-3 w-28 rounded bg-slate-100" />
      </div>
      <Skeleton className="hidden h-3 w-32 rounded bg-slate-100 md:block" />
      <Skeleton className="h-3 w-24 rounded bg-slate-100" />
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

function PaymentChip({ isCash }) {
  const { t } = useTranslation("adminPages");
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
      <FontAwesomeIcon
        icon={isCash ? faMoneyBillWave : faCreditCard}
        className="text-slate-400"
      />
      {isCash ? t("Cash") : t("Visa")}
    </span>
  )
}

function PackageBadge() {
  const { t } = useTranslation("adminPages");
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
      <PackageIcon size={12} aria-hidden="true" />
      {t("Package")}
    </span>
  )
}

function DiscountBadge({ value }) {
  return (
    <span className="inline-flex rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">
      -{value}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  Cell views                                */
/* -------------------------------------------------------------------------- */

function InvoiceCell({ inv }) {
  const time = formatTime(inv.date)

  return (
    <>
      <p className="font-semibold tabular-nums text-slate-900">
        #{inv.invoiceId}
      </p>
      <p className="mt-0.5 text-xs text-slate-500">
        {formatDate(inv.date)}
        {time && <span className="text-slate-400"> · {time}</span>}
      </p>
    </>
  )
}

function ClientCell({ inv }) {
  const { t } = useTranslation("adminPages");
  const clientName = inv.familyMemberName || inv.clientName || '-'

  return (
    <div className="flex items-center gap-3">
      <ClientAvatar
        name={clientName === '-' ? '' : clientName}
        colorSeed={inv.clientId || inv.userId || inv.invoiceId}
        sizeClass="h-10 w-10"
        textClass="text-[11px] font-semibold"
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
          {inv.familyMemberRelation ? `${inv.familyMemberRelation} · ` : ''}
          <span className="tabular-nums">{inv.mobileNumber || t("No phone")}</span>
        </p>
        {inv.cardNumber && (
          <p
            title={t("Card number")}
            className="mt-0.5 truncate font-mono text-[11px] tabular-nums text-slate-400"
          >
            {inv.cardNumber}
          </p>
        )}
      </div>
    </div>
  )
}

function ProviderCell({ inv }) {
  return (
    <div className="leading-tight">
      <p
        title={inv.providerNameEn}
        className="truncate font-medium text-slate-800"
      >
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
  )
}

function TypeCell({ inv }) {
  const { t } = useTranslation("adminPages");
  return (
    <div className="flex flex-col items-start gap-1.5">
      {inv.isMedicineInvoice == null ? (
        <span className="text-slate-400">-</span>
      ) : (
        <StatusBadge tone={inv.isMedicineInvoice ? 'primary' : 'neutral'}>
          {inv.isMedicineInvoice ? t("Medicine") : t("Service")}
        </StatusBadge>
      )}
      <PaymentChip isCash={inv.isCash} />
      {inv.isFromPackage && <PackageBadge />}
    </div>
  )
}

function AmountCell({ inv }) {
  const { t } = useTranslation("adminPages");
  const hasDiscount = Number(inv.discountPercentage) > 0

  return (
    <>
      <p className="text-[15px] font-semibold tabular-nums text-slate-900">
        {formatMoney(inv.totalAmount)}
      </p>

      {hasDiscount ? (
        <>
          <p className="mt-0.5 flex items-center justify-end gap-1.5 text-xs tabular-nums text-slate-400">
            <span className="line-through">{formatMoney(inv.priceBefore)}</span>
            <DiscountBadge value={formatPercentage(inv.discountPercentage)} />
          </p>
          <p className="mt-0.5 text-xs tabular-nums text-slate-500">
            {t("After:")} {formatMoney(inv.priceAfter)}
          </p>
        </>
      ) : (
        <p className="mt-0.5 text-xs text-slate-400">{t("No discount")}</p>
      )}
    </>
  )
}

function ItemsCell({ inv }) {
  const { t } = useTranslation("adminPages");
  return (
    <>
      <p className="font-medium tabular-nums text-slate-700">
        {inv.servicesCount ?? '-'}
      </p>
      <p className="text-xs tabular-nums text-slate-400">
        {t("Qty")} {inv.totalQuantity ?? '-'}
      </p>
    </>
  )
}

function StatusCell({ inv }) {
  return (
    <div className="flex items-center justify-center">
      <StatusBadge tone={STATUS_TONE[inv.status] ?? 'default'}>
        {inv.statusName}
      </StatusBadge>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                    Table                                   */
/* -------------------------------------------------------------------------- */

const CELL_RENDERERS = {
  invoice: InvoiceCell,
  client: ClientCell,
  provider: ProviderCell,
  type: TypeCell,
  amount: AmountCell,
  items: ItemsCell,
  status: StatusCell,
}

export default function InvoicesTable({
  invoices,
  isLoading,
  hasActiveFilters,
}) {
  const { t } = useTranslation("adminPages");
  const [timelineInvoiceId, setTimelineInvoiceId] = useState(null)
  const [detailsInvoiceId, setDetailsInvoiceId] = useState(null)

  const { data: detailsInvoice, isLoading: detailsLoading, error: detailsError, refetch: refetchDetails } =
    useInvoiceDetailsQuery(detailsInvoiceId, !!detailsInvoiceId)

  if (isLoading) {
    return <TableSkeleton />
  }

  if (!invoices.length) {
    return (
      <TableEmptyState
        icon={faFileInvoiceDollar}
        title={t("No invoices found")}
        hasActiveFilters={hasActiveFilters}
        emptyMessage={t("There are no invoices to display.")}
      />
    )
  }

  return (
    <div className="min-w-0">
      <ScrollableTable maxHeight="60vh">
        <table
          className="w-full table-fixed text-left text-sm"
          style={{ minWidth: TABLE_MIN_WIDTH }}
        >
          <colgroup>
            {COLUMNS.map((col) => (
              <col key={col.key} style={{ width: col.width }} />
            ))}
            <col style={{ width: ACTIONS_WIDTH }} />
          </colgroup>

          <thead className="sticky top-0 z-20 bg-slate-100">
            <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-600">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`whitespace-nowrap py-3 ${col.px || 'px-4'} ${ALIGN_CLASS[col.align]}`}
                >
                  {col.label}
                </th>
              ))}
              <TableActionsCell as="th"
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-center"
              >
                {t("Actions")}
              </TableActionsCell>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <tr
                key={inv.invoiceId}
                className="group bg-white align-middle transition-colors hover:bg-slate-50"
              >
                {COLUMNS.map((col) => {
                  const Cell = CELL_RENDERERS[col.key]
                  const isStatus = col.key === 'status'

                  return (
                    <td
                      key={col.key}
                      className={`py-4 ${col.px || 'px-4'} ${
                        col.key === 'amount' || col.key === 'items'
                          ? `${ALIGN_CLASS[col.align]} whitespace-nowrap`
                          : ''
                      } ${isStatus ? 'whitespace-nowrap' : ''}`}
                    >
                      <Cell inv={inv} />
                    </td>
                  )
                })}

                {/* Actions (sticky) */}
                <TableActionsCell
                  hoverColor="var(--color-slate-50)"
                  className="px-4 py-4 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <IconButton
                      title={t("View details")}
                      onClick={() => setDetailsInvoiceId(inv.invoiceId)}
                    >
                      <Eye size={16} />
                    </IconButton>
                    <IconButton
                      title={t("View timeline")}
                      tone="green"
                      onClick={() => setTimelineInvoiceId(inv.invoiceId)}
                    >
                      <History size={16} />
                    </IconButton>
                  </div>
                </TableActionsCell>
              </tr>
            ))}
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
          error={detailsError}
          onRetry={refetchDetails}
        />
      )}
    </div>
  )
}
