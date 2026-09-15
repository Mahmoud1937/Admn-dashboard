import { useState, useRef } from "react";
import SearchBarWithFilters from "../../../shared/components/SearchBarWithFilters";
import InvoicesFiltersPanel from "./InvoicesFilters";


const InvoicesSearchBar = ({
  search,
  setSearch,
  draftFilters,
  setDraftFilters,
  onApplyFilters,
  onClearFilters,
  activeFilterCount,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const panelRef = useRef(null);

  return (
    <div className="relative">
      <SearchBarWithFilters
        value={search}
        onChange={setSearch}
        placeholder="Search by Invoice ID, Phone, or Card Number..."
        onFilterClick={() => setShowFilters((prev) => !prev)}
        activeFilterCount={activeFilterCount}
        stacked={false}
      />

      {showFilters && (
        <InvoicesFiltersPanel
          panelRef={panelRef}
          draft={draftFilters}
          onChange={setDraftFilters}
          onApply={() => {
            onApplyFilters();
            setShowFilters(false);
          }}
          onClear={() => {
            onClearFilters();
            setShowFilters(false);
          }}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
};

export default InvoicesSearchBar;
