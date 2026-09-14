import FilterPanel from "../../../shared/components/FilterPanel";
import FilterPanelHeader from "../../../shared/components/FilterPanelHeader";
import FilterPanelFooter from "../../../shared/components/FilterPanelFooter";
import DateRangeFilterFields from "../../../shared/components/DateRangeFilterFields";

export default function CardMissedFilters({ draft, onChange, onApply, onClear, onClose, panelRef }) {
  return (
    <FilterPanel panelRef={panelRef} onClose={onClose} className="sm:w-72">
      <FilterPanelHeader onClose={onClose} />
      <DateRangeFilterFields
        draft={draft}
        onDraftChange={onChange}
        fromLabel="From Date"
        toLabel="To Date"
        stacked={false}
      />
      <div className="mb-3">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Missing Type
        </label>
        <select
          value={draft.missingType ?? ""}
          onChange={(event) => onChange((previous) => ({ ...previous, missingType: event.target.value }))}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
        >
          <option value="">All types</option>
          <option value="0">Missed</option>
          <option value="1">Damaged</option>
        </select>
      </div>
      <div className="mt-4">
        <FilterPanelFooter onClear={onClear} onApply={onApply} clearLabel="Clear" />
      </div>
    </FilterPanel>
  );
}
