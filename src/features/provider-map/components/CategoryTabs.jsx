import { useEffect, useRef, useState } from "react";
import {
  faPrescriptionBottleMedical,
  faFlask,
  faXRay,
  faHospital,
  faDumbbell,
  faPersonWalking,
  faTooth,
  faUserDoctor,
  faStethoscope,
  faChevronDown,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCategoriesQuery } from "../../categoreis/hooks/useCategoriesQuery";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { SkeletonText } from "../../../shared/components/Skeleton";
import useLanguage from "../../../localization/useLanguage";
import useProviderMapText from "../../../localization/useProviderMapText";

// Icons are matched by the category's English name (lowercased), since the
// real list now comes from the backend with real ids — this only decides
// which icon to show, it doesn't gate which categories exist.
const ICON_BY_NAME = {
  doctors: faUserDoctor,
  pharmacy: faPrescriptionBottleMedical,
  lab: faFlask,
  radiology: faXRay,
  hospital: faHospital,
  gym: faDumbbell,
  physio: faPersonWalking,
  dental: faTooth,
};
const FALLBACK_ICON = faStethoscope;
const COLOR_PALETTE = ["#dc2626", "#16a34a", "#7c3aed", "#2563eb", "#ea580c", "#0891b2", "#db2777", "#65a30d"];
function colorForId(id) {
  const n = Number(id) || 0;
  return COLOR_PALETTE[n % COLOR_PALETTE.length];
}

// The map marker layer uses the same category palette.
// eslint-disable-next-line react-refresh/only-export-components
export const CATEGORY_COLOR_BY_NAME = {
  doctors: "#0891b2",
  pharmacy: "#dc2626",
  lab: "#16a34a",
  radiology: "#7c3aed",
  hospital: "#2563eb",
  gym: "#ea580c",
  physio: "#0891b2",
  dental: "#db2777",
};
export const FALLBACK_CATEGORY_COLOR = "#6b7280";

const ALL_TAB = { id: null, icon: null };
const PAGE_SIZE = 8;
const SCROLL_THRESHOLD_PX = 40;

function toTab(c) {
  const enName = c.enName ?? c.nameEn ?? "";
  const arName = c.arName ?? c.nameAr ?? "";
  return {
    id: c.id,
    enName,
    arName,
    icon: ICON_BY_NAME[enName.toLowerCase()] || FALLBACK_ICON,
    color: colorForId(c.id),
  };
}

function tabLabel(tab, rtl) {
  const first = rtl ? (tab.arName || tab.enName) : (tab.enName || tab.arName);
  const second = tab.arName && tab.enName ? (rtl ? tab.enName : tab.arName) : "";
  return second ? `${first} - ${second}` : first;
}

export default function CategoryTabs({ activeCategoryId, onChange }) {
  const t = useProviderMapText();
  const { language, direction } = useLanguage();
  const rtl = direction === "rtl";
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [itemsState, setItemsState] = useState({ language, items: [] });
  const items = itemsState.language === language ? itemsState.items : [];
  const [selectedTab, setSelectedTab] = useState(ALL_TAB);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const loadedPageRef = useRef(0);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  // New search term -> start over from page 1.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPageNumber(1);
    setItemsState({ language, items: [] });
    loadedPageRef.current = 0;
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [debouncedSearch, language]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { categories, totalPages, isFetching } = useCategoriesQuery({
    pageNumber,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    language,
  });

  useEffect(() => {
    if (isFetching || loadedPageRef.current === pageNumber) return;
    loadedPageRef.current = pageNumber;
    const newTabs = categories.map(toTab);
    setItemsState((prev) => ({
      language,
      items: pageNumber === 1 ? newTabs : [...(prev.language === language ? prev.items : []), ...newTabs],
    }));
  }, [categories, isFetching, pageNumber, language]);

  const hasMore = pageNumber < totalPages;
  const isLoadingMore = isFetching && pageNumber > 1;
  const isInitialLoading = isFetching && items.length === 0;

  function handleScroll(e) {
    if (isFetching || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD_PX) {
      setPageNumber((p) => p + 1);
    }
  }

  function handleSelect(tab) {
    setSelectedTab(tab);
    onChange(tab.id);
    setIsOpen(false);
    setSearchInput("");
  }

  return (
    <div ref={containerRef} className="relative inline-block w-full text-start sm:w-64">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        {selectedTab.icon && <FontAwesomeIcon icon={selectedTab.icon} className="h-3.5 w-3.5 shrink-0" />}
        <span className="flex-1 truncate text-start">{selectedTab.id === null ? t("All") : tabLabel(selectedTab, rtl)}</span>
        <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3 shrink-0 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-[1100] mt-1 w-full sm:w-64 rounded-lg border border-gray-200 bg-white/90 shadow-lg backdrop-blur-sm">
          <div className="relative border-b border-gray-100 p-2">
            <FontAwesomeIcon
              icon={faSearch}
              className={`pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 ${rtl ? "right-5" : "left-5"}`}
            />
            <input
              type="text"
              autoFocus
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("Search categories...")}
              aria-label={t("Search categories...")}
              className={`w-full rounded-md border border-gray-200 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${rtl ? "pr-8 pl-2" : "pl-8 pr-2"}`}
            />
          </div>

          <div ref={listRef} onScroll={handleScroll} className="max-h-64 overflow-y-auto py-1">
            {!debouncedSearch && (
              <button
                type="button"
                onClick={() => handleSelect(ALL_TAB)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-start text-sm hover:bg-gray-50 ${
                  activeCategoryId === null ? "bg-blue-50 font-medium text-blue-700" : "text-gray-700"
                }`}
              >
                {t("All")}
              </button>
            )}

            {isInitialLoading && (
              <SkeletonText label={t("Loading...")} lines={3} className="space-y-2 px-3 py-3" />
            )}

            {!isInitialLoading && items.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-400">{t("No categories found.")}</div>
            )}

            {items.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelect(tab)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-start text-sm hover:bg-gray-50 ${
                  activeCategoryId === tab.id ? "bg-blue-50 font-medium text-blue-700" : "text-gray-700"
                }`}
              >
                {tab.icon && <FontAwesomeIcon icon={tab.icon} className="h-3.5 w-3.5" />}
                <span className="truncate">{tabLabel(tab, rtl)}</span>
              </button>
            ))}

            {isLoadingMore && (
              <SkeletonText label={t("Loading more...")} lines={1} className="space-y-2 px-3 py-3" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
