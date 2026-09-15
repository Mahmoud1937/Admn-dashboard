import { CheckCircle2, Clock, FileText, X } from "lucide-react";
import { useInvoiceTimeline } from "../hooks/useInvoiceTimeline";

const TAG_STYLES = {
  amber: "bg-amber-100 text-amber-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-600",
};

const CIRCLE_STYLES = {
  amber: "bg-amber-100 text-amber-600",
  green: "bg-emerald-100 text-emerald-600",
  red: "bg-red-100 text-red-600",
  blue: "bg-blue-100 text-blue-600",
};

export default function TimelineModal({ orderNo, onClose }) {
  const { steps, loading, error } = useInvoiceTimeline(orderNo);

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[200] p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Invoice Timeline</h3>
            <p className="text-sm mt-1">
              <span className="text-slate-500">Invoice No: </span>
              <span className="text-emerald-600 font-semibold">#{orderNo}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-2">
          <div className="max-h-64 overflow-y-auto pr-2">
            {loading && <p className="text-sm text-slate-400 py-4">Loading timeline...</p>}

            {!loading && error && (
              <p className="text-sm text-red-500 py-4">Failed to load timeline: {error}</p>
            )}

            {!loading && !error && steps.length === 0 && (
              <p className="text-sm text-slate-400 py-4">No timeline data available.</p>
            )}

            {!loading && !error && steps.length > 0 && (
              <div className="relative border border-slate-200 rounded-xl px-4 py-4">
                {steps.map((step, i) => {
                  const isUsed = step.icon === "check" || step.tagColor === "green" || step.tagColor === "blue";

                  return (
                    <div key={i} className="relative pb-4 last:pb-0 pl-9">
                      {i < steps.length - 1 && (
                        <div className="absolute top-8 bottom-0 left-[15px] w-px bg-slate-200" />
                      )}

                      <div
                        className={`absolute top-0 left-0 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          CIRCLE_STYLES[step.tagColor] || CIRCLE_STYLES.blue
                        }`}
                      >
                        {isUsed ? <CheckCircle2 size={16} /> : <FileText size={16} />}
                      </div>

                      <p className="font-semibold text-slate-900 text-[15px]">{step.title}</p>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                        <Clock size={12} />
                        <span>{step.date}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 min-w-0">
                        <span className="text-slate-400 shrink-0">by</span>
                        <span className="text-slate-700 truncate" title={step.by}>{step.by}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap shrink-0 ${
                            TAG_STYLES[step.tagColor] || TAG_STYLES.blue
                          }`}
                        >
                          {step.tag}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg cursor-pointer bg-white text-slate-900 border border-slate-300 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}