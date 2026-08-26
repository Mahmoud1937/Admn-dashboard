import { useState, useEffect, useMemo } from "react";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { normalizeArabic } from "../utils/Arabictext";
import { getAllGovernorateCenters } from "../utils/GovernorateCenters";

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


  const dedupedGovernorates = useMemo(() => {
    const all = getAllGovernorateCenters();
    const seen = new Set();
    return all.filter((g) => {
      const key = normalizeArabic(g.nameAr);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);


  return (
<div className="flex flex-wrap items-center gap-3">
  <select
    value={governorateId ?? ""}
    onChange={(e) => onGovernorateChange(e.target.value || null)}
    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
  >
    <option value="">All Governorates</option>

    {dedupedGovernorates.map((gov) => (
      <option key={gov.id} value={gov.id}>
        {gov.nameEn}
      </option>
    ))}
  </select>

  <div className="relative flex-1 min-w-[350px]">
    <FontAwesomeIcon
      icon={faSearch}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
    />

    <input
      type="text"
      value={localSearch}
      onChange={(e) => setLocalSearch(e.target.value)}
      placeholder="Search by Provider name or Branch address..."
      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
    />
  </div>
</div>
  );
}
