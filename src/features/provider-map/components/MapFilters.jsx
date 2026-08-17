import { useState, useEffect, useMemo } from "react";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { normalizeArabic } from "../utils/Arabictext";

export default function MapFilters({
  governorates,
  governorateId,
  onGovernorateChange,
  search,
  onSearchChange,
}) {
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebouncedValue(localSearch, 400);

  useEffect(() => {
    onSearchChange(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Dropdown shouldn't list the same governorate twice just because the
  // backend has duplicate/typo rows for it (e.g. "Cairoo" vs "القاهرة")
  const dedupedGovernorates = useMemo(() => {
    const seen = new Set();
    return governorates.filter((g) => {
      const key = normalizeArabic(g.nameAr);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [governorates]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={governorateId ?? ""}
        onChange={(e) => onGovernorateChange(e.target.value ? Number(e.target.value) : null)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        <option value="">All Governorates</option>
        {dedupedGovernorates.map((gov) => (
          <option key={gov.id} value={gov.id}>
            {gov.nameAr}
          </option>
        ))}
      </select>

      <div className="relative flex-1 min-w-[220px]">
        <FontAwesomeIcon
          icon={faSearch}
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search by name or address..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
    </div>
  );
}