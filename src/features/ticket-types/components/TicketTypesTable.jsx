import { faTicket } from "@fortawesome/free-solid-svg-icons";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import RowActions from "../../../shared/components/RowActions";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import { formatDate } from "../../../utils/formatDate";

export default function TicketTypesTable({
  ticketTypes,
  hasActiveFilters,
  onEdit,
  onDeleteRequest,
}) {
  if (ticketTypes.length === 0) {
    return (
      <TableEmptyState
        icon={faTicket}
        title="No ticket types found"
        hasActiveFilters={hasActiveFilters}
        emptyMessage="There are no ticket types to display."
      />
    );
  }

  return (
    <ScrollableTable maxHeight="60vh">
      <table className="w-full min-w-[800px] text-center text-sm">
        <thead className="sticky top-0 z-10 bg-slate-100">
          <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-400">

            <th className="px-6 py-3 text-center">English Name</th>
            <th className="px-6 py-3 text-center">Arabic Name</th>
            <th className="px-6 py-3 text-center">Created At</th>
            <th className="px-6 py-3 text-center">Created By</th>
            <th className="px-6 py-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {ticketTypes.map((ticketType) => (
            <tr
              key={ticketType.id}
              className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/60"
            >

              <td className="px-6 py-3 text-center font-medium text-slate-900">
                {ticketType.enName || "-"}
              </td>
              <td className="px-6 py-3 text-center text-slate-600" dir="rtl">
                {ticketType.arName || "-"}
              </td>
              <td className="px-6 py-3 text-center text-slate-600">
                {formatDate(ticketType.createdAt)}
              </td>
              <td className="max-w-[280px] px-6 py-3 text-center text-slate-600">
                <p className="truncate" title={ticketType.createdBy || ""}>
                  {ticketType.createdBy || "-"}
                </p>
              </td>
              <td className="px-6 py-3">
                <RowActions
                  onEdit={() => onEdit(ticketType)}
                  onDelete={() => onDeleteRequest(ticketType)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollableTable>
  );
}
