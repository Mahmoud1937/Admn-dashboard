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
      <div className="mt-4">
        <FilterPanelFooter onClear={onClear} onApply={onApply} clearLabel="Clear" />
      </div>
    </FilterPanel>
  );
}