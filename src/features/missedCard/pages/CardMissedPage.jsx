import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import CardMissedFilters from "../components/CardMissedFilters";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { emptyFilters, useCardMissedQuery } from "../hooks/useCardMissedQuery";
import { useCardMissedMutations } from "../hooks/useCardMissedMutations";
import CardMissedSearchBar from "../components/CardMissedSearchBar";
import CardMissedTable from "../components/CardMissedTable";
import Pagination from "../../../shared/components/Pagination";
import CardMissedCreateModal from "../components/CardMissedCreateModal";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import QueryErrorState from "../../../shared/components/QueryErrorState";

const countActiveMissedFilters = (filters) =>
  Object.values(filters).filter((value) => value !== "" && value !== null && value !== undefined).length;

export default function CardMissedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const cardPoolId = searchParams.get("CardPoolId");

  // Data passed from CardPoolTable's "Missed" link
  const from = location.state?.from;
  const to = location.state?.to;

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const filterPanelRef = useRef(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination({
    resetKey: `${cardPoolId}-${debouncedSearch}-${JSON.stringify(filters)}`,
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
    cardMisseds,
    totalCount,
    totalPages,
    isLoading,
    isError,
    error,
    isPlaceholderData,
    refetch
  } = useCardMissedQuery({ cardPoolId, pageNumber, pageSize, searchTerm: debouncedSearch, filters });


  const closeForm = () => {
    setIsFormOpen(false);
    clearServerErrors();
  };

  const { createMutation, deleteMutation, isSaving, serverErrors, clearServerErrors } =
    useCardMissedMutations({
      onCreateSuccess: closeForm,
      onDeleteSuccess: () => setItemToDelete(null),
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
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  const hasActiveFilters = !!search || countActiveMissedFilters(filters) > 0;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {cardPoolId && (
            <button
              type="button"
              onClick={() => navigate("/card-pools")}
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to Card Pools
            </button>
          )}

          <h1 className="text-2xl font-bold text-slate-900 sm:text-2xl">Missed / Damaged Cards</h1>

          <p className="mt-1 text-sm text-slate-500 sm:sm-sm">
  {cardPoolId && from && to ? (
    <>
      <span className="font-semibold text-slate-700">
        {totalCount ?? 0}
      </span>{" "}
      missed cards from{" "}
      <span className="font-medium text-slate-700">{from}</span> to{" "}
      <span className="font-medium text-slate-700">{to}</span>.
    </>
  ) : (
    "Track and report missing or damaged cards."
  )}
</p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <FontAwesomeIcon icon={faPlus} />
          Report Card
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="relative">
          <CardMissedSearchBar
            value={search}
            onChange={setSearch}
            onFilterClick={openFilters}
            activeFilterCount={countActiveMissedFilters(filters)}
          />

          {isFilterOpen && (
            <CardMissedFilters
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
          <p className="p-8 text-center text-sm text-slate-400">Loading records...</p>
        )}

{isError && (
  <QueryErrorState
    title="Unable to load missed card"
    error={error}
    onRetry={refetch}
  />
)}

        {!isLoading && !isError && (
          <div className={`transition-opacity ${isPlaceholderData ? "opacity-60" : "opacity-100"}`}>
            <CardMissedTable
              items={cardMisseds}
              hasActiveFilters={hasActiveFilters}
              onDelete={(item) => setItemToDelete(item)}
            />

            {(cardMisseds?.length ?? 0) > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel="records"
                onGoToPage={(page) => goToPage(page, totalPages)}
                onPageSizeChange={handlePageSizeChange}
                getPageNumbers={getPageNumbers}
              />
            )}
          </div>
        )}
      </div>

      <CardMissedCreateModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={handleSave}
        isSaving={isSaving}
        serverErrors={serverErrors}
      />

      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        title="Delete Record"
        message={`Are you sure you want to delete the record for card "${itemToDelete?.cardNumber}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
