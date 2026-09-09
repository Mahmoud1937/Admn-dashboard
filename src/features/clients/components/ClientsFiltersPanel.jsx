import { PLATFORM_TYPE } from "../hooks/useClientsQuery";
import FilterPanel from "../../../shared/components/FilterPanel";
import FilterPanelHeader from "../../../shared/components/FilterPanelHeader";
import FilterPanelFooter from "../../../shared/components/FilterPanelFooter";

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
  const set = (field) => (e) =>
    onChange((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <FilterPanel panelRef={panelRef} onClose={onClose} className="sm:w-80">
      <FilterPanelHeader onClose={onClose} />

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">Platform</label>
        {select(draft.platformType, set("platformType"), {
          placeholder: "All platforms",
          items: [
            { value: PLATFORM_TYPE.ANDROID, label: "Android" },
            { value: PLATFORM_TYPE.IOS, label: "iOS" },
            { value: PLATFORM_TYPE.WEB, label: "Web" },
          ],
        })}
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">Gender</label>
        {select(draft.isMale, set("isMale"), {
          placeholder: "All genders",
          items: [
            { value: "true", label: "Male" },
            { value: "false", label: "Female" },
          ],
        })}
      </div>

      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">Card</label>
        {select(draft.hasCard, set("hasCard"), {
          placeholder: "All",
          items: [
            { value: "true", label: "Has card" },
            { value: "false", label: "No card" },
          ],
        })}
      </div>

      <FilterPanelFooter onClear={onClear} onApply={onApply} />
    </FilterPanel>
  );
}