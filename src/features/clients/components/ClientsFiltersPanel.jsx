import { PLATFORM_TYPE } from "../hooks/useClientsQuery";
import FilterPanel from "../../../shared/components/FilterPanel";
import FilterPanelHeader from "../../../shared/components/FilterPanelHeader";
import FilterPanelFooter from "../../../shared/components/FilterPanelFooter";
import useClientsText from "../../../localization/useClientsText";
import useLanguage from "../../../localization/useLanguage";

const fieldClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400";
const select = (value, onChange, options) => (
  <select
    value={value}
    onChange={onChange}
    className={fieldClass}
  >
    <option value="">{options.placeholder}</option>
    {options.items.map((opt) => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

export default function ClientsFiltersPanel({ draft, onChange, onApply, onClear, onClose, panelRef }) {
  const t = useClientsText();
  const { direction } = useLanguage();
  const set = (field) => (e) =>
    onChange((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <FilterPanel panelRef={panelRef} onClose={onClose} side={direction === "rtl" ? "left" : "right"} className="sm:w-80">
      <FilterPanelHeader title={t("Filters")} closeLabel={t("Close filters")} onClose={onClose} />

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">{t("Platform")}</label>
        {select(draft.platformType, set("platformType"), {
          placeholder: t("All platforms"),
          items: [
            { value: PLATFORM_TYPE.ANDROID, label: t("Android") },
            { value: PLATFORM_TYPE.IOS, label: t("iOS") },
            { value: PLATFORM_TYPE.WEB, label: t("Web") },
          ],
        })}
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">{t("Gender")}</label>
        {select(draft.isMale, set("isMale"), {
          placeholder: t("All genders"),
          items: [
            { value: "true", label: t("Male") },
            { value: "false", label: t("Female") },
          ],
        })}
      </div>

      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">{t("Card")}</label>
        {select(draft.hasCard, set("hasCard"), {
          placeholder: t("All"),
          items: [
            { value: "true", label: t("Has card") },
            { value: "false", label: t("No card") },
          ],
        })}
      </div>

      <FilterPanelFooter onClear={onClear} onApply={onApply} clearLabel={t("Clear all")} applyLabel={t("Apply")} />
    </FilterPanel>
  );
}
