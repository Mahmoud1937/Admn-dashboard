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
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCategoriesQuery } from "../../categoreis/hooks/useCategoriesQuery";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";

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

// Deterministic color per category so a given category always renders with
// the same tab color across renders/sessions.
const COLOR_PALETTE = ["#dc2626", "#16a34a", "#7c3aed", "#2563eb", "#ea580c", "#0891b2", "#db2777", "#65a30d"];
function colorForId(id) {
  const n = Number(id) || 0;
  return COLOR_PALETTE[n % COLOR_PALETTE.length];
}

// provider.branches[].type / provider.type on the map data is a plain string
// (e.g. "Doctors"), not the categoryId used for filtering — this lookup is
// what map pins use to pick a color/icon for a given type string.
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

const ALL_TAB = { id: null, label: "All", icon: null };
const PAGE_SIZE = 8;
// Start loading the next page once the scroll position is this many pixels
// from the bottom of the list.
const SCROLL_THRESHOLD_PX = 40;

function toTab(c) {
  // NOTE: backend casing for this endpoint hasn't been confirmed yet —
  // supporting both arName/enName and nameAr/nameEn until we see a real response.
  const enName = c.enName ?? c.nameEn ?? "";
  const arName = c.arName ?? c.nameAr ?? "";
  const label = enName && arName ? `${enName} - ${arName}` : enName || arName;
  return {
    id: c.id,
    label,
    icon: ICON_BY_NAME[enName.toLowerCase()] || FALLBACK_ICON,
    color: colorForId(c.id),
  };
}

export default function CategoryTabs({ activeCategoryId, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  // Accumulated across pages as the user scrolls, reset whenever the search
  // term changes.
  const [items, setItems] = useState([]);
  // Remembers the label/icon of whatever was last picked so the closed
  // control still shows it even once that item scrolls out of the loaded list.
  const [selectedTab, setSelectedTab] = useState(ALL_TAB);

  const containerRef = useRef(null);
  const listRef = useRef(null);
  const loadedPageRef = useRef(0);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  // New search term -> start over from page 1.
  useEffect(() => {
    setPageNumber(1);
    setItems([]);
    loadedPageRef.current = 0;
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [debouncedSearch]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { categories, totalPages, isLoading, isFetching } = useCategoriesQuery({
    pageNumber,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
  });

  // Append (or, for page 1, replace) once a page's real data has arrived -
  // guarded by loadedPageRef so placeholderData from react-query doesn't
  // cause the same page to be appended twice while it refetches.
  useEffect(() => {
    if (isFetching || loadedPageRef.current === pageNumber) return;
    loadedPageRef.current = pageNumber;
    const newTabs = categories.map(toTab);
    setItems((prev) => (pageNumber === 1 ? newTabs : [...prev, ...newTabs]));
  }, [categories, isFetching, pageNumber]);

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
    <div ref={containerRef} className="relative inline-block w-64 text-left">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        {selectedTab.icon && <FontAwesomeIcon icon={selectedTab.icon} className="h-3.5 w-3.5 shrink-0" />}
        <span className="flex-1 truncate text-left">{selectedTab.label}</span>
        <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3 shrink-0 text-gray-400" />
      </button>

      {isOpen && (
        // z-[1100]: Leaflet's own controls (zoom +/-, attribution, etc.) sit at
        // z-index 1000, so this needs to clear that or the map's zoom control
        // renders on top of the dropdown. bg-white/90 + backdrop-blur instead of
        // a plain opacity on the whole panel: only the background is translucent
        // (map shows through behind it) while text/icons stay fully opaque and
        // readable.
        <div className="absolute z-[1100] mt-1 w-64 rounded-lg border border-gray-200 bg-white/90 shadow-lg backdrop-blur-sm">
          <div className="relative border-b border-gray-100 p-2">
            <FontAwesomeIcon
              icon={faSearch}
              className="pointer-events-none absolute left-5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              autoFocus
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search categories..."
              className="w-full rounded-md border border-gray-200 py-1.5 pl-8 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div ref={listRef} onScroll={handleScroll} className="max-h-64 overflow-y-auto py-1">
            {!debouncedSearch && (
              <button
                type="button"
                onClick={() => handleSelect(ALL_TAB)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                  activeCategoryId === null ? "bg-blue-50 font-medium text-blue-700" : "text-gray-700"
                }`}
              >
                All
              </button>
            )}

            {isInitialLoading && (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-gray-400">
                <FontAwesomeIcon icon={faSpinner} className="h-3.5 w-3.5 animate-spin" />
                Loading...
              </div>
            )}

            {!isInitialLoading && items.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-400">No categories found.</div>
            )}

            {items.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelect(tab)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                  activeCategoryId === tab.id ? "bg-blue-50 font-medium text-blue-700" : "text-gray-700"
                }`}
              >
                {tab.icon && <FontAwesomeIcon icon={tab.icon} className="h-3.5 w-3.5" />}
                <span className="truncate">{tab.label}</span>
              </button>
            ))}

            {isLoadingMore && (
              <div className="flex items-center justify-center gap-2 px-3 py-2 text-xs text-gray-400">
                <FontAwesomeIcon icon={faSpinner} className="h-3 w-3 animate-spin" />
                Loading more...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}