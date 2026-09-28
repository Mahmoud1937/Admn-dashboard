import { X } from "lucide-react";
import StatusBadge from "../../../../shared/components/StatusBadge";

export default function TicketDetailsHeader({
  ticketId,
  isClosed,
  colorStyle,
  onClose,
}) {
  const hasColor = Boolean(colorStyle);

  return (
    <div
      className={`flex items-start justify-between px-6 py-5 ${
        hasColor ? colorStyle.header : "bg-blue-900"
      }`}
    >
      <div>
        <h3
          className={`text-lg font-semibold ${
            hasColor ? colorStyle.title : "text-white"
          }`}
        >
          Ticket Details
        </h3>
        <p
          className={`mt-1 flex items-center gap-2 text-sm ${
            hasColor ? `${colorStyle.title} opacity-80` : "text-slate-300"
          }`}
        >
          <span>Ticket ID</span>
          <span
            className={`rounded-md bg-white px-2 py-0.5 font-mono text-xs font-semibold ${
              hasColor ? colorStyle.title : "text-blue-900"
            }`}
          >
            #{ticketId}
          </span>
          {typeof isClosed === "boolean" && (
            <StatusBadge tone={isClosed ? "success" : "warning"}>
              {isClosed ? "Closed" : "Open"}
            </StatusBadge>
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className={`cursor-pointer rounded-full p-1.5 transition ${
          hasColor
            ? `${colorStyle.title} hover:bg-black/5`
            : "text-slate-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        <X size={18} />
      </button>
    </div>
  );
}