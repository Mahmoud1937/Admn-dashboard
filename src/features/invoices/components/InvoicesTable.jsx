import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileInvoiceDollar, faMoneyBillWave, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import { Eye, History } from "lucide-react";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import { useInvoiceDetailsQuery } from "../../clients/hooks/useInvoiceDetailsQuery";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import { formatDate } from "../../../utils/formatDate";
import StatusBadge from "../../../shared/components/StatusBadge";
import TimelineModal from "./TimelineModal";
import InvoiceDetailsModal from "../../clients/components/InvoiceDetailsModal";

const STATUS_TONE = {
  1: "success", // Paid
  2: "warning", // Pending
  3: "danger",  // Canceled
  4: "info",    // Used
};

const formatMoney = (n) => `${Number(n).toFixed(2)} EGP`;

export default function InvoicesTable({ invoices, isLoading, hasActiveFilters }) {
  const [timelineInvoiceId, setTimelineInvoiceId] = useState(null);
  const [detailsInvoiceId, setDetailsInvoiceId] = useState(null);

  const { data: detailsInvoice, isLoading: detailsLoading } = useInvoiceDetailsQuery(
    detailsInvoiceId,
    !!detailsInvoiceId
  );

  if (isLoading) {
    return <div className="py-10 text-center text-sm text-slate-400">Loading invoices...</div>;
  }

  if (!invoices.length) {
    return (
      <TableEmptyState
        icon={faFileInvoiceDollar}
        title="No invoices found"
        hasActiveFilters={hasActiveFilters}
        emptyMessage="There are no invoices to display."
      />
    );
  }

  return (
    <div className="min-w-0 border border-gray-200 rounded-lg">
      <ScrollableTable maxHeight="60vh">
        <table className="min-w-[1700px] w-full">
          <thead className="bg-slate-100 sticky top-0 z-10">
            <tr className="border-b border-slate-200">
              <th className="w-24 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Invoice ID</th>
              <th className="w-[300px] px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Client</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Date</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Card Number</th>
              <th className="w-[220px] px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Provider</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Branch</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Payment</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Price Before</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Price After</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Total</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Services</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, idx) => {
              const clientName = inv.familyMemberName || inv.clientName || "-";

              return (
                <tr
                  key={inv.invoiceId}
                  className={`border-b border-slate-50 last:border-0 transition-all hover:bg-primary-600/10 hover:text-primary-600 ${
                    idx % 2 === 1 ? "bg-slate-50/40" : ""
                  }`}
                >
                <td className="px-4 py-3 text-sm font-medium text-slate-500 whitespace-nowrap text-center">
                  #{inv.invoiceId}
                </td>
                <td className="w-[300px] max-w-[300px] px-4 py-3">
                  <div className="mx-auto flex max-w-[240px] items-center gap-3 whitespace-nowrap rounded-[7px] px-2 py-1.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-500">
                      {(inv.familyMemberName || inv.clientName || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        title={clientName}
                        className="block overflow-hidden whitespace-nowrap text-left text-sm font-medium text-slate-700"
                        dir="ltr"
                        style={{
                          direction: "ltr",
                          textOverflow: "clip ellipsis",
                          unicodeBidi: "plaintext",
                        }}
                      >
                        {clientName}
                      </p>
                      {inv.familyMemberRelation && (
                      <p className="mt-0.5 text-[11px] font-normal text-slate-400">
      {inv.familyMemberRelation}
    </p>
                      )}
                    </div>



                               {/* <div className="min-w-0 flex-1">
  <p
    title={clientName}
    className="truncate text-sm font-medium text-slate-700"
    dir="ltr"
  >
    {clientName}
  </p>

  {inv.familyMemberRelation && (
    <p className="mt-0.5 text-[11px] font-normal text-slate-400">
      {inv.familyMemberRelation}
    </p>
  )}
</div> */}
         
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap text-center">
                  <p>{formatDate(inv.date)}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(inv.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap text-center">{inv.mobileNumber || "-"}</td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap text-center">{inv.cardNumber || "-"}</td>
                <td className="w-[220px] max-w-[220px] px-4 py-3 text-center">
                  <div className="mx-auto max-w-[190px] leading-tight">
                    <p className="truncate text-sm text-slate-500">
                      {inv.providerNameEn || "-"}
                    </p>
                    {inv.providerNameAr && (
                      <p
                        className="mt-0.5 truncate text-xs text-slate-400"
                        dir="rtl"
                      >
                        {inv.providerNameAr}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap text-center">{inv.providerBranchName || "-"}</td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500">
                    <FontAwesomeIcon
                      icon={inv.isCash ? faMoneyBillWave : faCreditCard}
                      className="text-slate-400"
                      size="sm"
                    />
                    {inv.isCash ? "Cash" : "Visa"}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap text-center">{formatMoney(inv.priceBefore)}</td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap text-center">{formatMoney(inv.priceAfter)}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-700 whitespace-nowrap text-center">{formatMoney(inv.totalAmount)}</td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap text-center">{inv.servicesCount}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center justify-center">
                    <StatusBadge tone={STATUS_TONE[inv.status] ?? "default"}>
                      {inv.statusName}
                    </StatusBadge>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setDetailsInvoiceId(inv.invoiceId)}
                      title="View Details"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => setTimelineInvoiceId(inv.invoiceId)}
                      title="Timeline"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600"
                    >
                      <History size={16} />
                    </button>
                  </div>
                </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollableTable>

      {timelineInvoiceId && (
        <TimelineModal orderNo={timelineInvoiceId} onClose={() => setTimelineInvoiceId(null)} />
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
  );
}
