import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import CardPoolFilters from "../components/Cardpoolfilters";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { useCardPoolMutations } from "../hooks/useCardPoolMutations";
import { emptyFilters, useCardPoolQuery } from "../hooks/useCardPoolQuery";
import SearchBarWithFilters from "../../../shared/components/SearchBarWithFilters";
import CardPoolTable from "../components/Cardpooltable";
import Pagination from "../../../shared/components/Pagination";
import CardPoolCreateModal from "../components/Cardpoolcreatemodal";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import QueryErrorState from "../../../shared/components/QueryErrorState";



export default function CardPoolPage() {
  const countActivePoolFilters = (filters) =>
    Object.values(filters).filter((value) => value !== "" && value !== null && value !== undefined).length;

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const filterPanelRef = useRef(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [poolToDelete, setPoolToDelete] = useState(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination({
    resetKey: `${debouncedSearch}-${JSON.stringify(filters)}`,
  });

  useEffect(() => {
    if (!isFilterOpen) return;

    const handleClickOutside = (e) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  const {
    cardPools,
    totalCount,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    isPlaceholderData,
  } = useCardPoolQuery({
    pageNumber,
    pageSize,
    searchTerm: debouncedSearch,
  filters,
  });


  const closeForm = () => {
    setIsFormOpen(false);
    clearServerErrors();
  };

  const {
    createMutation,
    exportMutation,
    deleteMutation,
    exportingId,
    isSaving,
    serverErrors,
    clearServerErrors,
  } = useCardPoolMutations({
    onCreateSuccess: closeForm,
    onDeleteSuccess: () => setPoolToDelete(null),
  });

  const openFilters = () => {
    setDraftFilters(filters);
    setIsFilterOpen(true);
  };

  const applyFilters = () => {
    setFilters(draftFilters);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setDraftFilters(emptyFilters);
  };

  const openAddForm = () => setIsFormOpen(true);

  const handleSave = (payload) => {
    createMutation.mutate(payload);
  };

  const confirmDelete = () => {
    if (poolToDelete) {
      deleteMutation.mutate(poolToDelete.id);
    }
  };

  const hasActiveFilters = !!search || countActivePoolFilters(filters) > 0;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-2xl">Card Pools</h1>
          <p className="mt-1 text-sm text-slate-500 sm:sm-sm">
            Manage generated card pools and export them for distribution.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <FontAwesomeIcon icon={faPlus} />
          Create Pool
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="relative">
          <SearchBarWithFilters
            value={search}
            onChange={setSearch}
            placeholder="Search Card Pool No..."
            onFilterClick={openFilters}
            activeFilterCount={countActivePoolFilters(filters)}
          />

          {isFilterOpen && (
            <CardPoolFilters
              draft={draftFilters}
              onChange={setDraftFilters}
              onApply={applyFilters}
              onClear={clearFilters}
              onClose={() => setIsFilterOpen(false)}
              panelRef={filterPanelRef}
            />
          )}
        </div>

        {isLoading && (
          <p className="p-8 text-center text-sm text-slate-400">Loading card pools...</p>
        )}

  {isError && (
  <QueryErrorState
    title="Unable to load Card Pools"
    error={error}
    onRetry={refetch}
  />
)}

        {!isLoading && !isError && (
          <div className={`transition-opacity ${isPlaceholderData ? "opacity-60" : "opacity-100"}`}>
            <CardPoolTable
              items={cardPools}
              hasActiveFilters={hasActiveFilters}
              onExport={(id) => exportMutation.mutate(id)}
              exportingId={exportingId}
              onDelete={(pool) => setPoolToDelete(pool)}
            />

            {(cardPools?.length ?? 0) > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel="card pools"
                onGoToPage={(page) => goToPage(page, totalPages)}
                onPageSizeChange={handlePageSizeChange}
                getPageNumbers={getPageNumbers}
              />
            )}
          </div>
        )}
      </div>

      <CardPoolCreateModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={handleSave}
        isSaving={isSaving}
        serverErrors={serverErrors}
      />

      <ConfirmDeleteModal
        isOpen={!!poolToDelete}
        title="Delete Card Pool"
        message={`Are you sure you want to delete card pool "${poolToDelete?.from} - ${poolToDelete?.to}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPoolToDelete(null)}
      />
    </div>
  );
}
