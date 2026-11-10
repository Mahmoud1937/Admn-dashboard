import { useTranslation } from "react-i18next";
import { useMemo, useState } from 'react'
import { faTicket } from '@fortawesome/free-solid-svg-icons'
import {
  AlertCircle,
  Building2,
  CalendarDays,
  CircleDot,
  CreditCard,
  Eye,
  Phone,
  UserPen,
  Users,
} from 'lucide-react'
import StatusBadge from '../../../shared/components/StatusBadge'
import TableEmptyState from '../../../shared/components/TableEmptyState'
import LazyImageCell from '../../../shared/components/LazyImageCell'
import ImageLightbox from '../../../shared/components/ImageLightbox'

import { formatDate } from '../../../utils/formatDate'
import { PRIORITY_TONE } from '../utils/ticketDetailsUtils'
import { COLOR_STYLES, getColumnColorName } from '../utils/ticketColors'
import { SkeletonText } from "../../../shared/components/Skeleton";

const RTL_TEXT_PATTERN = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/

const GROUP_OPTIONS = [
  { key: 'group', label: 'Assigned Group', icon: Users },
  { key: 'priority', label: 'Priority', icon: AlertCircle },
  { key: 'status', label: 'Status', icon: CircleDot },
]

// returns { id, title, arTitle } for the column a ticket belongs to
function getColumn(ticket, groupBy) {
  if (groupBy === 'priority') {
    return {
      id: String(ticket.priority ?? 'none'),
      title: ticket.priorityName || 'No priority',
    }
  }
  if (groupBy === 'status') {
    return {
      id: ticket.isClosed ? 'closed' : 'open',
      title: ticket.isClosed ? 'Closed' : 'Open',
    }
  }
  return {
    id: String(ticket.assignedToGroup?.id ?? 'none'),
    title: ticket.assignedToGroup?.enName || 'Unassigned',
    arTitle: ticket.assignedToGroup?.arName,
  }
}

function InfoRow({ icon: Icon, children, title, dir }) {
  return (
    <p className="flex items-center gap-1.5" title={title}>
      <Icon size={13} className="shrink-0 text-slate-400" />
      <span className="truncate" dir={dir}>
        {children}
      </span>
    </p>
  )
}
function getInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '?'
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}
function TicketCard({ ticket, onViewTicket, onPreview ,color}) {
  const { t } = useTranslation("adminPages");
  const clientName = ticket.userName || ''
  const hasImage =
    typeof ticket.clientImage === 'string' &&
    ticket.clientImage.trim() &&
    !ticket.clientImage.endsWith('medicardeg.com/')
  const description = ticket.description || ''
  const descriptionDirection = RTL_TEXT_PATTERN.test(description) ? 'rtl' : 'ltr'

  return (
    <div
      onClick={() => onViewTicket(ticket.id)}
      className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-300 hover:shadow-md"
    >
      {/* badges */}
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <StatusBadge tone={PRIORITY_TONE[ticket.priority] || 'neutral'}>
          {ticket.priorityName || '-'}
        </StatusBadge>
        <StatusBadge tone={ticket.isClosed ? 'success' : 'warning'}>
          {ticket.isClosed ? t("Closed") : t("Open")}
        </StatusBadge>
      </div>

      {/* type */}
      <div className="text-left" dir="ltr">
        <p className="text-left text-sm font-semibold text-slate-800">
          {ticket.ticketType?.enName || '-'}
        </p>
        {ticket.ticketType?.arName && (
          <p className="text-left text-xs text-slate-400" dir="rtl">
            {ticket.ticketType.arName}
          </p>
        )}
      </div>

      {/* description */}
      {description && (
        <p
          title={description}
          dir={descriptionDirection}
          className="mt-2 line-clamp-2 text-xs text-slate-500"
        >
          {description}
        </p>
      )}

      {/* provider / card / phone */}
      <div className="mt-2 space-y-1 text-xs text-slate-500">
        {ticket.provider?.enName && (
          <div className="text-left" dir="ltr">
            <InfoRow icon={Building2} title={ticket.provider.enName}>
              {ticket.provider.enName}
            </InfoRow>
            {ticket.provider.arName && (
              <p className="ml-5 truncate text-left text-[11px] text-slate-400" dir="rtl">
                {ticket.provider.arName}
              </p>
            )}
          </div>
        )}
        {ticket.cardNumber && (
          <InfoRow icon={CreditCard}>{ticket.cardNumber}</InfoRow>
        )}
        {ticket.userPhoneNumber && (
          <InfoRow icon={Phone} dir="ltr">
            {ticket.userPhoneNumber}
          </InfoRow>
        )}
      </div>

      {/* footer */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
        <div
          className="flex min-w-0 items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
{hasImage ? (
  <LazyImageCell
    url={ticket.clientImage}
    label={clientName}
    onPreview={onPreview}
    size="h-6 w-6"
  />
) : (
  <span
    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${color.badge}`}
    title={clientName}
  >
    {getInitials(clientName)}
  </span>
)}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <CalendarDays size={12} />
            {formatDate(ticket.createdAt)}
          </span>
          <Eye
            size={14}
            className="text-slate-300 group-hover:text-blue-600"
          />
        </div>
      </div>

      {ticket.createdByName && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
          <UserPen size={12} className="shrink-0" />
          <span className="truncate" dir="auto">
            {ticket.createdByName}
          </span>
        </p>
      )}
    </div>
  )
}

export default function TicketsBoard({
  tickets,
  isLoading,
  hasActiveFilters,
  onViewTicket,
}) {
  const { t } = useTranslation("adminPages");
  const [previewImage, setPreviewImage] = useState(null)
  const [groupBy, setGroupBy] = useState('group')

  const columns = useMemo(() => {
    const map = new Map()
    tickets.forEach((ticket) => {
      const col = getColumn(ticket, groupBy)
      if (!map.has(col.id)) map.set(col.id, { ...col, tickets: [] })
      map.get(col.id).tickets.push(ticket)
    })

    const list = [...map.values()]
    if (groupBy === 'status') {
      list.sort((a) => (a.id === 'open' ? -1 : 1))
    } else if (groupBy === 'priority') {
      list.sort((a, b) => Number(b.id) - Number(a.id))
    } else {
      // "Unassigned" always goes last
      list.sort((a, b) => (a.id === 'none' ? 1 : b.id === 'none' ? -1 : 0))
    }
    return list
  }, [tickets, groupBy])

  const ColumnIcon =
    GROUP_OPTIONS.find((option) => option.key === groupBy)?.icon || Users

  if (isLoading) {
    return (
      <div role="status" aria-busy="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <span className="sr-only">{t("Loading tickets...")}</span>
        {Array.from({ length: 3 }, (_, index) => (
          <SkeletonText key={index} lines={6} className="min-w-0 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4" />
        ))}
      </div>
    )
  }

  if (!tickets.length) {
    return (
      <TableEmptyState
        icon={faTicket}
        title={t("No tickets found")}
        hasActiveFilters={hasActiveFilters}
        emptyMessage={t("There are no tickets to display.")}
      />
    )
  }

  return (
    <div>
      {/* group-by toggle */}
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {t("Group by")}
        </span>
        <div className="flex rounded-lg bg-slate-100 p-0.5">
          {GROUP_OPTIONS.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setGroupBy(option.key)}
                className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${
                  groupBy === option.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon size={13} />
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* board */}
      <div className="flex items-start gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const colorName = getColumnColorName(column, groupBy)
          const color = COLOR_STYLES[colorName]

          return (
            <section
              key={column.id}
              className={`flex max-h-[65vh] w-[300px] shrink-0 flex-col overflow-hidden rounded-xl border-t-4 ${color.bar} ${color.body}`}
            >
              <header
                className={`flex items-center justify-between gap-2 px-3 py-2.5 ${color.header}`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <ColumnIcon size={15} className={`shrink-0 ${color.icon}`} />
                  <div className="min-w-0 text-left" dir="ltr">
                    <h3
                      className={`truncate text-left text-sm font-semibold ${color.title}`}
                    >
                      {column.title}
                    </h3>
                    {column.arTitle && (
                      <p
                        className={`truncate text-left text-xs opacity-70 ${color.title}`}
                        dir="rtl"
                      >
                        {column.arTitle}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${color.badge}`}
                >
                  {column.tickets.length}
                </span>
              </header>

              <div className="flex-1 space-y-2.5 overflow-y-auto p-2.5">
                {column.tickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                      color={color}
                    onViewTicket={(id) => onViewTicket(id, colorName)}
                    onPreview={(url, label) => setPreviewImage({ url, label })}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <ImageLightbox
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  )
}