import { useState, useRef, useEffect, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

const PAGE_SIZE = 20;

/**
 * Generic searchable, paginated, async select — combobox style.
 * A single input doubles as the display field and the search field:
 * closed, it shows the selected label; on focus it clears and becomes
 * a live search box, reverting back on blur if nothing new was picked.
 *
 * Controlled component: pass `value` + `onChange` (works directly with
 * react-hook-form's <Controller field={...} />).
 *
 * fetchItems: (pageNumber, pageSize, searchTerm) => Promise<{ data: { items, pageNumber, totalPages } }>
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
  panelZIndexClassName = "z-30",
  panelBgClassName = "bg-white",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 300);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const [selectedLabel, setSelectedLabel] = useState(null);

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
    enabled: isOpen || (Boolean(value) && !selectedLabel),
  });

  const items = data?.pages.flatMap((page) => page?.data?.items ?? []) ?? [];

  useEffect(() => {
    if (value === "" || value === null || value === undefined) {
      setSelectedLabel(null);
      return;
    }
    const match = items.find((item) => String(getOptionValue(item)) === String(value));
    if (match) setSelectedLabel(getOptionLabel(match));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, items]);

  useEffect(() => {
    if (isOpen) return;
    if (!value || selectedLabel) return;
    if (isFetchingNextPage || !hasNextPage) return;
    fetchNextPage();
  }, [isOpen, value, selectedLabel, isFetchingNextPage, hasNextPage, fetchNextPage]);

  // Close (and revert any un-picked search text) on outside click
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
    inputRef.current?.blur();
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSelectedLabel(null);
    setSearchInput("");
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsOpen(true);
    // Start the search box empty so typing immediately filters,
    // instead of requiring the user to clear the current label first.
    setSearchInput("");
  };

  // While open, the input is a live search box; while closed, it just
  // displays the selected label (or the placeholder via the placeholder prop).
  const displayValue = isOpen ? searchInput : (selectedLabel || "");

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-sm outline-none focus-within:border-blue-400 ${
          disabled ? "bg-slate-50 text-slate-400" : ""
        } ${error ? "border-red-400" : "border-slate-200"}`}
      >
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={displayValue}
          onFocus={handleFocus}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={isOpen ? searchPlaceholder : placeholder}
          className="w-full min-w-0 truncate bg-transparent outline-none placeholder:text-slate-400 disabled:text-slate-400"
        />
        <span className="flex shrink-0 items-center gap-2">
          {clearable && selectedLabel && !disabled && (
            <FontAwesomeIcon
              icon={faXmark}
              onClick={handleClear}
              className="cursor-pointer text-xs text-slate-400 hover:text-slate-600"
            />
          )}
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`text-xs text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </span>
      </div>

      {isOpen && (
        <div
          className={`absolute ${panelZIndexClassName} mt-1 w-full rounded-lg border border-slate-200 ${panelBgClassName} shadow-lg`}
        >
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
                    // onMouseDown fires before the input's onBlur/outside-click
                    // handler, so the click still registers as a selection.
                    onMouseDown={(e) => e.preventDefault()}
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