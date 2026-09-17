import { faTicket } from "@fortawesome/free-solid-svg-icons";
import { Eye } from "lucide-react";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import StatusBadge from "../../../shared/components/StatusBadge";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import { formatDate } from "../../../utils/formatDate";

const PRIORITY_TONE = {
  0: "neutral",
  1: "warning",
  2: "danger",
};

export default function TicketsTable({
  tickets,
  isLoading,
  hasActiveFilters,
  onViewTicket,
}) {
  if (isLoading) {
    return <p className="p-8 text-center text-sm text-slate-400">Loading tickets...</p>;
  }

  if (!tickets.length) {
    return (
      <TableEmptyState
        icon={faTicket}
        title="No tickets found"
        hasActiveFilters={hasActiveFilters}
        emptyMessage="There are no tickets to display."
      />
    );
  }

  return (
    <ScrollableTable maxHeight="60vh">
      <table className="w-full min-w-[1500px] text-center text-sm">
        <thead className="sticky top-0 z-10 bg-slate-100">
          <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3 text-center">ID</th>
            <th className="px-4 py-3 text-center">Client</th>
            <th className="px-4 py-3 text-center">Phone</th>
            <th className="px-4 py-3 text-center">Card Number</th>
            <th className="px-4 py-3 text-center">Ticket Type</th>
            <th className="px-4 py-3 text-center">Provider</th>
            <th className="px-4 py-3 text-center">Group</th>
            <th className="px-4 py-3 text-center">Priority</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-center">Created By</th>
            <th className="px-4 py-3 text-center">Closed By</th>
            <th className="px-4 py-3 text-center">Created At</th>
            <th className="px-4 py-3 text-center">Description</th>
            <th className="px-4 py-3 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map((ticket) => {
            const clientName = ticket.userName || "-";

            return (
              <tr
                key={ticket.id}
                className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/60"
              >
              <td className="px-4 py-3 font-medium text-slate-500">#{ticket.id}</td>
              <td className="w-[300px] max-w-[300px] px-4 py-3">
                <div className="mx-auto flex max-w-[240px] items-center gap-3 whitespace-nowrap rounded-[7px] px-2 py-1.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-500">
                    {(ticket.userName || "?").charAt(0).toUpperCase()}
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
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">{ticket.userPhoneNumber || "-"}</td>
              <td className="px-4 py-3 text-slate-600">{ticket.cardNumber || "-"}</td>
              <td className="px-4 py-3 text-slate-600">
                <p className="font-medium text-slate-800">
                  {ticket.ticketType?.enName || "-"}
                </p>
                {ticket.ticketType?.arName && (
                  <p className="mt-0.5 text-xs text-slate-400" dir="rtl">
                    {ticket.ticketType.arName}
                  </p>
                )}
              </td>
              <td className="max-w-[220px] px-4 py-3 text-slate-600">
                <p className="truncate font-medium text-slate-800" title={ticket.provider?.enName || ""}>
                  {ticket.provider?.enName || "-"}
                </p>
                {ticket.provider?.arName && (
                  <p className="mt-0.5 truncate text-xs text-slate-400" dir="rtl">
                    {ticket.provider.arName}
                  </p>
                )}
              </td>
              <td className="px-4 py-3 text-slate-600">
                <p>{ticket.assignedToGroup?.enName || "-"}</p>
                {ticket.assignedToGroup?.arName && (
                  <p className="mt-0.5 text-xs text-slate-400" dir="rtl">
                    {ticket.assignedToGroup.arName}
                  </p>
                )}
              </td>
              <td className="px-4 py-3">
                <StatusBadge tone={PRIORITY_TONE[ticket.priority] || "neutral"}>
                  {ticket.priorityName || "-"}
                </StatusBadge>
              </td>
              <td className="px-4 py-3">
                <StatusBadge tone={ticket.isClosed ? "success" : "warning"}>
                  {ticket.isClosed ? "Closed" : "Open"}
                </StatusBadge>
              </td>
              <td className="max-w-[220px] px-4 py-3 text-slate-600">
                <p className="truncate" title={ticket.createdByName || ""}>
                  {ticket.createdByName || "-"}
                </p>
              </td>
              <td className="max-w-[220px] px-4 py-3 text-slate-600">
                <p className="truncate" title={ticket.closedByName || ""}>
                  {ticket.closedByName || "-"}
                </p>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {formatDate(ticket.createdAt)}
              </td>
              <td className="max-w-[260px] px-4 py-3 text-slate-600">
                <p className="truncate" title={ticket.description || ""}>
                  {ticket.description || "-"}
                </p>
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onViewTicket(ticket.id)}
                  title="View Details"
                  className="mx-auto flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                >
                  <Eye size={16} />
                </button>
              </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ScrollableTable>
  );
}
