import { useState, useRef, useEffect, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faSpinner, faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

const PAGE_SIZE = 20;

/**
 * Generic searchable, paginated, async select.
 * Controlled component: pass `value` + `onChange` (works directly with
 * react-hook-form's <Controller field={...} />).
 *
 * fetchItems: (pageNumber, pageSize, searchTerm) => Promise<{ data: { items, pageNumber, totalPages } }>
 *   (matches the getCategories / getSpecialists service signature already in the project)
 */
export default function SearchableAsyncSelect({
  queryKey,
  fetchItems,
  value,
  onChange,
  getOptionLabel = (item) => item.enName,
  getOptionValue = (item) => item.id,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  disabled = false,
  clearable = true,
  error,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 300);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: [...queryKey, "search", search],
    queryFn: ({ pageParam = 1 }) => fetchItems(pageParam, PAGE_SIZE, search),
    getNextPageParam: (lastPage) => {
      const pageNumber = lastPage?.data?.pageNumber ?? 1;
      const totalPages = lastPage?.data?.totalPages ?? 1;
      return pageNumber < totalPages ? pageNumber + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: isOpen,
  });

  const items = data?.pages.flatMap((page) => page?.data?.items ?? []) ?? [];

  // We may not have the selected item loaded yet (e.g. edit mode, before
  // the user opens the dropdown) — carry a cached label so the closed
  // button still shows something meaningful instead of just the raw id.
  const [selectedLabel, setSelectedLabel] = useState(null);
  useEffect(() => {
    if (value === "" || value === null || value === undefined) {
      setSelectedLabel(null);
      return;
    }
    const match = items.find((item) => String(getOptionValue(item)) === String(value));
    if (match) setSelectedLabel(getOptionLabel(match));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, items]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchInput("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || isFetchingNextPage || !hasNextPage) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  const handleSelect = (item) => {
    onChange(getOptionValue(item));
    setSelectedLabel(getOptionLabel(item));
    setIsOpen(false);
    setSearchInput("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSelectedLabel(null);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-400 ${
          error ? "border-red-400" : "border-slate-200"
        }`}
      >
        <span className={`truncate ${selectedLabel ? "text-slate-900" : "text-slate-400"}`}>
          {selectedLabel || placeholder}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {clearable && selectedLabel && !disabled && (
            <FontAwesomeIcon
              icon={faXmark}
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-slate-600"
            />
          )}
          <FontAwesomeIcon icon={faChevronDown} className="text-xs text-slate-400" />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="relative border-b border-slate-100 p-2">
            <FontAwesomeIcon
              icon={faSearch}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400"
            />
            <input
              autoFocus
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-md border border-slate-200 py-1.5 pl-8 pr-2 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div ref={listRef} onScroll={handleScroll} className="max-h-56 overflow-y-auto py-1">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-slate-400">
                <FontAwesomeIcon icon={faSpinner} spin />
                Loading...
              </div>
            ) : items.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-400">No results found.</p>
            ) : (
              <>
                {items.map((item) => (
                  <button
                    type="button"
                    key={getOptionValue(item)}
                    onClick={() => handleSelect(item)}
                    className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                      String(getOptionValue(item)) === String(value)
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700"
                    }`}
                  >
                    {getOptionLabel(item)}
                  </button>
                ))}
                {isFetchingNextPage && (
                  <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-400">
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Loading more...
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}