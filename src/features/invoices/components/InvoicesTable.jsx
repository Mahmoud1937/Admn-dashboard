import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileInvoiceDollar, faMoneyBillWave, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import StatusBadge from "../../../shared/components/StatusBadge";
import { formatDate } from "../../../utils/formatDate";

const STATUS_TONE = {
  1: "success", // Paid
  2: "warning", // Pending
  3: "danger",  // Canceled
  4: "info",    // Used
};

const formatMoney = (n) => `${Number(n).toFixed(2)} EGP`;

export default function InvoicesTable({ invoices, isLoading, hasActiveFilters }) {
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
        <table className="min-w-[1500px] w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Client</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Date</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Card Number</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Provider</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Branch</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Payment</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Price Before</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Price After</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Total</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Services</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, idx) => (
              <tr
                key={inv.invoiceId}
                className={`border-b border-slate-50 last:border-0 transition-all hover:bg-primary-600/10 hover:text-primary-600 ${
                  idx % 2 === 1 ? "bg-slate-50/40" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 whitespace-nowrap rounded-[7px] px-2 py-1.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-500">
                      {(inv.clientName || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{inv.clientName || "-"}</p>
                      {inv.familyMemberName && (
                        <p className="text-xs text-slate-400">for {inv.familyMemberName}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap text-center">{formatDate(inv.date)}</td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap text-center">{inv.mobileNumber || "-"}</td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap text-center">{inv.cardNumber || "-"}</td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap text-center">{inv.providerNameEn || "-"}</td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap text-center">{inv.providerBranchName || "-"}</td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500">
                    <FontAwesomeIcon
                      icon={inv.isCash ? faMoneyBillWave : faCreditCard}
                      className="text-slate-400"
                      size="sm"
                    />
                    {inv.isCash ? "Cash" : "Card"}
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
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTable>
    </div>
  );
}
