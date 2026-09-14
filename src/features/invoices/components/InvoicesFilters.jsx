import FilterPanel from "../../../shared/components/FilterPanel";
import FilterPanelFooter from "../../../shared/components/FilterPanelFooter";
import FilterPanelHeader from "../../../shared/components/FilterPanelHeader";
import DateRangeFilterFields from "../../../shared/components/DateRangeFilterFields";
import ProviderSelect from "../../clients/components/Providerselect";
import { INVOICE_STATUS } from "../constants/InvoiceStatus";
import ProviderBranchSelect from "./ProviderBranchSelect";


const fieldClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400";

const select = (value, onChange, options) => (
  <select value={value} onChange={onChange} className={fieldClass}>
    <option value="">{options.placeholder}</option>
    {options.items.map((opt) => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

export default function InvoicesFiltersPanel({ draft, onChange, onApply, onClear, onClose, panelRef }) {
  const set = (field) => (e) =>
    onChange((prev) => ({ ...prev, [field]: e.target.value }));

  const setProvider = (value) =>
    onChange((prev) => ({ ...prev, providerId: value, providerBranchId: "" }));

  const setBranch = (value) =>
    onChange((prev) => ({ ...prev, providerBranchId: value }));

  return (
    <FilterPanel panelRef={panelRef} onClose={onClose} className="sm:w-80">
      <FilterPanelHeader onClose={onClose} />

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">Provider</label>
        <ProviderSelect
          value={draft.providerId}
          onChange={setProvider}
          placeholder="All providers"
          className="w-full"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">Branch</label>
        <ProviderBranchSelect
          value={draft.providerBranchId}
          onChange={setBranch}
          providerId={draft.providerId}
          placeholder="All branches"
          className="w-full"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">Status</label>
        {select(draft.status, set("status"), {
          placeholder: "All statuses",
          items: [
            { value: INVOICE_STATUS.PAID, label: "Paid" },
            { value: INVOICE_STATUS.PENDING, label: "Pending" },
            { value: INVOICE_STATUS.CANCELED, label: "Canceled" },
            { value: INVOICE_STATUS.USED, label: "Used" },
          ],
        })}
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">Payment type</label>
        {select(draft.isCash, set("isCash"), {
          placeholder: "All",
          items: [
            { value: "true", label: "Cash" },
            { value: "false", label: "Card" },
          ],
        })}
      </div>

      <DateRangeFilterFields
        draft={draft}
        onDraftChange={onChange}
        fromLabel="From date"
        toLabel="To date"
        stacked={false}
      />

      <FilterPanelFooter onClear={onClear} onApply={onApply} />
    </FilterPanel>
  );
}
