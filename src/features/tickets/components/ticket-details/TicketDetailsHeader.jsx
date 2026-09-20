import { X } from "lucide-react";
import StatusBadge from "../../../../shared/components/StatusBadge";
import { TAG_STYLES } from "../../utils/ticketDetailsUtils";
import { STATUS_OPTIONS } from "../../constants/ticketOptions";

export default function TicketDetailsHeader({
  ticketId,
  ticket,
  isEditing,
  editValues,
  currentStatus,
  visibleFieldErrors,
  onClose,
  onEditValueChange,
}) {
  return (
    <div className="flex items-start justify-between bg-blue-900 px-6 py-5">
      <div>
        <h3 className="text-lg font-semibold text-white">Ticket Details</h3>
        <p className="mt-1 flex items-center gap-2 text-sm text-slate-300">
          <span>Ticket ID</span>
          <span className="rounded-md bg-white  px-2 py-0.5 font-mono text-xs font-semibold text-blue-900">
            #{ticketId}
          </span>
          {ticket && !isEditing && (
            <StatusBadge tone={ticket.isClosed ? "success" : "warning"}>
              {ticket.isClosed ? "Closed" : "Open"}
            </StatusBadge>
          )}
          {ticket && isEditing && editValues && (
            <select
              value={editValues.isClosed}
              onChange={(e) => onEditValueChange("isClosed", e.target.value)}
              className="rounded-md border border-white/20 bg-white px-2 py-0.5 text-xs font-semibold text-blue-900 outline-none"
            >
              <option value="false">Open</option>
              <option value="true">Closed</option>
            </select>
          )}
          {ticket && !isEditing && (
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                TAG_STYLES[currentStatus.color]
              }`}
            >
              {currentStatus.label}
            </span>
          )}
          {ticket && isEditing && editValues && (
            <select
              value={editValues.status}
              onChange={(e) => onEditValueChange("status", e.target.value)}
              disabled={editValues.isClosed === "true"}
              title={
                editValues.isClosed === "true"
                  ? "Closed tickets must use the Closed status"
                  : undefined
              }
              className="rounded-md border border-white/20 bg-white px-2 py-0.5 text-xs font-semibold text-blue-900 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              {STATUS_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          )}
        </p>
        {isEditing &&
          (visibleFieldErrors.isClosed || visibleFieldErrors.status) && (
            <p className="mt-1 text-xs text-red-200">
              {visibleFieldErrors.isClosed || visibleFieldErrors.status}
            </p>
          )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="cursor-pointer rounded-full p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        <X size={18} />
      </button>
    </div>
  );
}
