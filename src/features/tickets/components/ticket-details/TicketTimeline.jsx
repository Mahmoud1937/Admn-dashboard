import { CheckCircle2, Clock, FileText } from "lucide-react";
import { formatDateTimeShort } from "../../../../utils/formatDate";
import {
  CIRCLE_STYLES,
  TAG_STYLES,
  getTicketStatus,
} from "../../utils/ticketDetailsUtils";

export default function TicketTimeline({
  timelines,
  isEditing,
  editValues,
  visibleFieldErrors,
  onEditValueChange,
}) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Timeline
      </p>

      {timelines.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
          No timeline data available.
        </p>
      ) : (
        <div className="relative rounded-xl border border-slate-200 px-4 py-4">
          {timelines.map((item, i) => {
            const author = item.createdByName || item.createdBy || "-";
            const isLastTimelineItem = i === timelines.length - 1;
            const statusInfo = getTicketStatus(item.status);
            const statusLabel = item.statusName || statusInfo.label;
            const tagColor = statusInfo.color;
            const isUsed = tagColor === "green" || tagColor === "blue";

            return (
              <div key={item.id} className="relative pb-4 last:pb-0 pl-9">
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

                {isEditing && editValues && isLastTimelineItem ? (
                  <>
                    <textarea
                      value={editValues.reply}
                      onChange={(e) =>
                        onEditValueChange("reply", e.target.value)
                      }
                      rows={3}
                      className={`mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm leading-6 text-slate-700 outline-none focus:border-blue-400 ${
                        visibleFieldErrors.reply
                          ? "border-red-400"
                          : "border-slate-200"
                      }`}
                    />
                    {visibleFieldErrors.reply && (
                      <p className="mt-1 text-xs text-red-500">
                        {visibleFieldErrors.reply}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-1.5 text-sm leading-6 text-slate-700">
                    {item.reply || "-"}
                  </p>
                )}

                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock size={12} />
                  <span>{formatDateTimeShort(item.createdAt)}</span>
                </div>

                <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                  <span className="shrink-0 text-slate-400">by</span>
                  <span className="truncate text-slate-700" title={author}>
                    {author}
                  </span>
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
      )}
    </div>
  );
}
