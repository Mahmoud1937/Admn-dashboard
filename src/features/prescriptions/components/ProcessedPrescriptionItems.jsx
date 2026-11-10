import StatusBadge from "../../../shared/components/StatusBadge";
import useLanguage from "../../../localization/useLanguage";
import usePrescriptionsText from "../../../localization/usePrescriptionsText";

export default function ProcessedPrescriptionItems({ items }) {
  const t = usePrescriptionsText();
  const { direction } = useLanguage();
  const rtl = direction === "rtl";
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <section aria-label={t("Processed items")} dir={direction} className="rounded-2xl border border-slate-200 bg-white p-5 text-start">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-slate-900">{t("Processed items")}</h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600">{items.length}</span>
      </div>

      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={`${item.serviceId}-${item.providerId ?? "none"}-${index}`} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 dir="auto" className="break-words text-start text-sm font-semibold text-slate-900">
                  {(rtl ? item.serviceArName || item.serviceEnName : item.serviceEnName || item.serviceArName) || `${t(item.isMedicine ? "Medicine" : "Service")} #${item.serviceId}`}
                </h3>
                {item.serviceEnName && item.serviceArName && item.serviceArName !== item.serviceEnName && (
                  <p dir="auto" className="mt-1 break-words text-start text-xs text-slate-500">{rtl ? item.serviceEnName : item.serviceArName}</p>
                )}
              </div>
              <StatusBadge tone={item.isMedicine ? "primary" : "neutral"} size="sm" className="shrink-0">
                {t(item.isMedicine ? "Medicine" : "Service")}
              </StatusBadge>
            </div>

            <dl className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-t border-slate-100 pt-3">
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">{t("Provider")}</dt>
                <dd className="mt-1 text-sm text-slate-800">
                  <p dir="auto" className="break-words text-start">
                    {(rtl ? item.providerArName || item.providerEnName : item.providerEnName || item.providerArName) || (item.providerId != null ? t("Provider #{{id}}", { id: item.providerId }) : t("Not assigned"))}
                  </p>
                  {item.providerEnName && item.providerArName && item.providerArName !== item.providerEnName && (
                    <p dir="auto" className="mt-1 break-words text-start text-xs text-slate-500">{rtl ? item.providerEnName : item.providerArName}</p>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">{t("Quantity added")}</dt>
                <dd className="mt-1 text-sm font-semibold tabular-nums text-slate-900">{item.quantityAdded ?? "—"}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
