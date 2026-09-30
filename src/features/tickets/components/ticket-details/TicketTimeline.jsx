import { CheckCircle2, Clock, FileText } from "lucide-react";
import { formatDateTimeShort } from "../../../../utils/formatDate";
import {
  CIRCLE_STYLES,
  TAG_STYLES,
  getTicketStatus,
} from "../../utils/ticketDetailsUtils";

export default function TicketTimeline({ timelines }) {
  if (timelines.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
        No timeline data available.
      </p>
    );
  }

  return (
    <div className="relative rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      {timelines.map((item, i) => {
        const statusInfo = getTicketStatus(item.status, item.statusName);
        const statusLabel = item.statusName || statusInfo.label;
        const tagColor = statusInfo.color;
        const isUsed = tagColor === "green" || tagColor === "blue";

        return (
          <div key={item.id} className="relative pb-4 pl-9 last:pb-0">
            {i < timelines.length - 1 && (
              <div className="absolute top-8 bottom-0 left-[15px] w-px bg-slate-200" />
            )}

            <div
              className={`absolute top-0 left-0 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                CIRCLE_STYLES[tagColor] || CIRCLE_STYLES.blue
              }`}
            >
              {isUsed ? <CheckCircle2 size={16} /> : <FileText size={16} />}
            </div>

            <p className="text-[15px] font-semibold text-slate-900">
              {statusLabel}
            </p>

            <p className="mt-1.5 text-sm leading-6 text-slate-700">
              {item.reply || "-"}
            </p>

            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
              <Clock size={12} />
              <span>{formatDateTimeShort(item.createdAt)}</span>
            </div>

            <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
              <span
                className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  TAG_STYLES[tagColor] || TAG_STYLES.blue
                }`}
              >
                {statusLabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
