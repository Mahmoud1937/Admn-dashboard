import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { useCardSoldQuery } from "../hooks/useCardSoldQuery";
import { useCardSoldMutations } from "../hooks/useCardSoldMutations";
import CardSoldFilters from "../components/CardSoldFilters";
import CardSoldTable from "../components/CardSoldTable";
import Pagination from "../../../shared/components/Pagination";
import CardSoldCreateModal from "../components/CardSoldCreateModal";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";

export default function CardSoldPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [soldToDelete, setSoldToDelete] = useState(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    lockPageSize,
    getPageNumbers,
  } = useServerPagination({ resetKey: debouncedSearch });

  const {
    cardSolds,
    totalCount,
    totalPages,
    serverPageSize,
    isLoading,
    isError,
    error,
    isPlaceholderData,
  } = useCardSoldQuery({ pageNumber, pageSize, searchTerm: debouncedSearch });

  lockPageSize(serverPageSize);

  const closeForm = () => {
    setIsFormOpen(false);
    clearServerErrors();
  };

  const {
    createByCountMutation,
    createByNumbersMutation,
    exportMutation,
    deleteMutation,
    exportingId,
    isSaving,
    serverErrors,
    clearServerErrors,
  } = useCardSoldMutations({
    onCreateSuccess: closeForm,
    onDeleteSuccess: () => setSoldToDelete(null),
  });

  const openAddForm = () => setIsFormOpen(true);

  const handleSave = ({ type, payload }) => {
    if (type === "count") {
      createByCountMutation.mutate(payload);
    } else {
      createByNumbersMutation.mutate(payload);
    }
  };

  const confirmDelete = () => {
    if (soldToDelete) {
      deleteMutation.mutate(soldToDelete.id);
    }
  };

  const hasActiveFilters = !!search;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-2xl">Sold Cards</h1>
          <p className="mt-1 text-sm text-slate-500 sm:sm-sm">
            Manage sold cards and export them for records.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <FontAwesomeIcon icon={faPlus} />
          Sell Cards
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <CardSoldFilters searchTerm={search} onSearchChange={setSearch} />

        {isLoading && (
          <p className="p-8 text-center text-sm text-slate-400">Loading sold cards...</p>
        )}

        {isError && (
          <p className="p-8 text-center text-sm text-red-500">
            {error?.message || "Failed to load sold cards."}
          </p>
        )}

        {!isLoading && !isError && (
          <div className={`transition-opacity ${isPlaceholderData ? "opacity-60" : "opacity-100"}`}>
            <CardSoldTable
              items={cardSolds}
              hasActiveFilters={hasActiveFilters}
              onExport={(id) => exportMutation.mutate(id)}
              exportingId={exportingId}
              onDelete={(sold) => setSoldToDelete(sold)}
            />

            {(cardSolds?.length ?? 0) > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel="sold cards"
                onGoToPage={(page) => goToPage(page, totalPages)}
                onPageSizeChange={handlePageSizeChange}
                getPageNumbers={getPageNumbers}
              />
            )}
          </div>
        )}
      </div>

      <CardSoldCreateModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={handleSave}
        isSaving={isSaving}
        serverErrors={serverErrors}
      />

      <ConfirmDeleteModal
        isOpen={!!soldToDelete}
        title="Delete Sold Card"
        message={`Are you sure you want to delete sold card record "${soldToDelete?.from} - ${soldToDelete?.to}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setSoldToDelete(null)}
      />
    </div>
  );
}