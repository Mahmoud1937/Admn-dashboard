// shared/components/InvoiceDetailsModal.jsx
import { Calendar, Tag, CheckCircle2, Clock, XCircle, X } from 'lucide-react'

const STATUS_STYLE = {
  Paid: { badge: 'bg-blue-50 text-blue-600', icon: Calendar, iconWrap: 'bg-blue-50', iconColor: 'text-blue-600' },
  Pending: { badge: 'bg-amber-50 text-amber-600', icon: Clock, iconWrap: 'bg-amber-50', iconColor: 'text-amber-600' },
  Canceled: { badge: 'bg-red-50 text-red-600', icon: XCircle, iconWrap: 'bg-red-50', iconColor: 'text-red-600' },
  Used: { badge: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2, iconWrap: 'bg-emerald-50', iconColor: 'text-emerald-600' },
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function formatMoney(value) {
  return Number(value ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function InvoiceDetailsModal({ isOpen, onClose, invoice, isLoading }) {
  if (!isOpen) return null

  if (isLoading || !invoice) {
    return (
      <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[200] p-3 sm:p-4" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex items-center justify-center py-16"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm">Loading invoice details...</span>
          </div>
        </div>
      </div>
    )
  }

  const style = STATUS_STYLE[invoice.status] || STATUS_STYLE.Paid
  const StatusIcon = style.icon
  const items = invoice.items?.items ?? []
  const familyName = [invoice.familyFirstName, invoice.familyLastName]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[200] p-3 sm:p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl flex items-center justify-center ${style.iconWrap}`}>
              <StatusIcon size={20} className={style.iconColor} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                Invoice Details
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                Invoice No:{' '}
                <span className={`font-semibold ${style.iconColor}`}>
                  #{invoice.invoiceId}
                </span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="border-t border-slate-100" />

        <div className="px-6 sm:px-8 py-5 sm:py-6">
          {/* Status */}
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-5 sm:mb-6 ${style.badge}`}>
            {invoice.status || '-'}
          </span>

          {/* Info */}
          <div className={`grid ${familyName ? 'grid-cols-3' : 'grid-cols-2'} gap-4 sm:gap-6 mb-6 sm:mb-8`}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-sm text-slate-400 mb-1.5">
                <Calendar size={14} />
                <span>Date</span>
              </div>
              <p className="text-base font-semibold" dir="ltr">{formatDate(invoice.date)}</p>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400 mb-1.5">Services</div>
              <p className="text-base font-semibold">{items.length}</p>
            </div>
            {familyName && (
              <div className="text-center">
                <div className="text-sm text-slate-400 mb-1.5">Family Member</div>
                <p className="text-base font-semibold truncate">{familyName}</p>
              </div>
            )}
          </div>

          {/* Services */}
          <h4 className="text-base font-semibold text-slate-900 mb-3">Services</h4>

          <div className="rounded-xl border border-slate-100 overflow-hidden mb-6">
            <div className="max-h-72 overflow-y-auto overflow-x-auto">
              <table className="w-full table-fixed text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-xs sticky top-0 z-10">
                    <th className="text-center px-3 sm:px-5 py-3">#</th>
                    <th className="text-center px-3 sm:px-5 py-3">Service</th>
                    <th className="text-center px-3 sm:px-5 py-3">Price Before</th>
                    <th className="text-center px-3 sm:px-5 py-3">Price After</th>
                    <th className="text-center px-3 sm:px-5 py-3">Discount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id ?? index} className="border-t border-slate-100">
                      <td className="px-3 sm:px-5 py-3.5 text-center">{index + 1}</td>
                      <td className="px-3 sm:px-5 py-3.5 text-center">
                        <p className="font-medium">{item.serviceNameEn || item.serviceName}</p>
                        <p className="text-xs text-slate-400">{item.serviceNameAr}</p>
                      </td>
                      <td className="px-3 sm:px-5 py-3.5 text-center whitespace-nowrap">
                        {formatMoney(item.priceBefore)}
                      </td>
                      <td className="px-3 sm:px-5 py-3.5 text-center whitespace-nowrap">
                        {formatMoney(item.priceAfter)}
                      </td>
                      <td className="px-3 sm:px-5 py-3.5 text-center whitespace-nowrap">
                        {Number(item.discountPercentage ?? 0).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 mb-2">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Total Before Discount</span>
              <span className="whitespace-nowrap">{formatMoney(invoice.totalBefore)} EGP</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Discount</span>
              <span>{Number(invoice.discountPercentage ?? 0).toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center gap-1.5 text-base text-slate-500">
                <Tag size={16} />
                <span>Total After Discount</span>
              </div>
              <span className="text-lg font-bold text-emerald-600 whitespace-nowrap">
                {formatMoney(invoice.totalAfter)} EGP
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}