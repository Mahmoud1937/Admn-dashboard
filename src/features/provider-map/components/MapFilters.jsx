import { useState, useEffect, useMemo, useRef } from "react";
import { faSearch, faChevronDown, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { normalizeArabic } from "../utils/Arabictext";
import { getAllGovernorateCenters } from "../utils/GovernorateCenters";
import useLanguage from "../../../localization/useLanguage";
import useProviderMapText from "../../../localization/useProviderMapText";

function governorateLabel(governorate, rtl) {
  return rtl
    ? `${governorate.nameAr} - ${governorate.nameEn}`
    : `${governorate.nameEn} - ${governorate.nameAr}`;
}

export default function MapFilters({
  governorateId,
  onGovernorateChange,
  search,
  onSearchChange,
}) {
  const t = useProviderMapText();
  const { direction } = useLanguage();
  const rtl = direction === "rtl";
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebouncedValue(localSearch, 400);

  const [govOpen, setGovOpen] = useState(false);
  const [govQuery, setGovQuery] = useState("");
  const govContainerRef = useRef(null);
  const govInputRef = useRef(null);

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

  const filteredGovernorates = useMemo(() => {
    const q = normalizeArabic(govQuery);
    if (!q) return dedupedGovernorates;
    return dedupedGovernorates.filter(
      (g) =>
        normalizeArabic(g.nameAr).includes(q) ||
        normalizeArabic(g.nameEn).includes(q)
    );
  }, [govQuery, dedupedGovernorates]);

  const selectedGovernorate = dedupedGovernorates.find(
    (g) => String(g.id) === String(governorateId)
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (govContainerRef.current && !govContainerRef.current.contains(e.target)) {
        setGovOpen(false);
        setGovQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (govOpen) govInputRef.current?.focus();
  }, [govOpen]);

  const selectGovernorate = (id) => {
    onGovernorateChange(id);
    setGovOpen(false);
    setGovQuery("");
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:w-64" ref={govContainerRef}>
        <button
          type="button"
          onClick={() => setGovOpen((o) => !o)}
          className="flex items-center justify-between w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
        >
          <span className="truncate text-start">
            {selectedGovernorate
              ? governorateLabel(selectedGovernorate, rtl)
              : t("All Governorates")}
          </span>
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`ms-2 shrink-0 text-slate-400 transition-transform ${govOpen ? "rotate-180" : ""}`}
          />
        </button>

        {govOpen && (
         <div className="absolute z-[600] mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 p-2">
              <div className="relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className={`absolute top-1/2 -translate-y-1/2 text-xs text-slate-400 ${rtl ? "right-2.5" : "left-2.5"}`}
                />
                <input
                  ref={govInputRef}
                  value={govQuery}
                  onChange={(e) => setGovQuery(e.target.value)}
                  placeholder={t("Search governorate...")}
                  aria-label={t("Search governorate...")}
                  className={`w-full rounded-lg border border-slate-200 py-1.5 text-sm outline-none focus:border-blue-400 ${rtl ? "pr-7 pl-2" : "pl-7 pr-2"}`}
                />
              </div>
            </div>

            <ul className="max-h-64 overflow-y-auto py-1">
              <li>
                <button
                  type="button"
                  onClick={() => selectGovernorate(null)}
                  className={`flex w-full items-center justify-between px-3 py-1.5 text-start text-sm hover:bg-blue-50 ${
                    governorateId == null ? "bg-blue-50 font-medium text-blue-600" : "text-slate-700"
                  }`}
                >
                  {t("All Governorates")}
                  {governorateId == null && (
                    <FontAwesomeIcon icon={faCheck} className="text-xs text-blue-500" />
                  )}
                </button>
              </li>

              {filteredGovernorates.length === 0 && (
                <li className="px-3 py-2 text-sm text-slate-400">{t("No results")}</li>
              )}

              {filteredGovernorates.map((gov) => (
                <li key={gov.id}>
                  <button
                    type="button"
                    onClick={() => selectGovernorate(gov.id)}
                    className={`flex w-full items-center justify-between px-3 py-1.5 text-start text-sm hover:bg-blue-50 ${
                      String(governorateId) === String(gov.id)
                        ? "bg-blue-50 font-medium text-blue-600"
                        : "text-slate-700"
                    }`}
                  >
                    <span>{governorateLabel(gov, rtl)}</span>
                    {String(governorateId) === String(gov.id) && (
                      <FontAwesomeIcon icon={faCheck} className="text-xs text-blue-500" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="relative w-full min-w-0 sm:min-w-[280px] sm:flex-1">
        <FontAwesomeIcon
          icon={faSearch}
          className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${rtl ? "right-4" : "left-4"}`}
        />

        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={t("Search by Provider name or Branch address...")}
          aria-label={t("Search by Provider name or Branch address...")}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white ${rtl ? "pr-11 pl-4" : "pl-11 pr-4"}`}
        />
      </div>
    </div>
  );
}
