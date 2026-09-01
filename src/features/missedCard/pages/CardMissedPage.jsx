import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { useCardMissedQuery } from "../hooks/useCardMissedQuery";
import { useCardMissedMutations } from "../hooks/useCardMissedMutations";
import CardMissedFilters from "../components/CardMissedFilters";
import CardMissedTable from "../components/CardMissedTable";
import Pagination from "../../../shared/components/Pagination";
import CardMissedCreateModal from "../components/CardMissedCreateModal";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";

export default function CardMissedPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    lockPageSize,
    getPageNumbers,
  } = useServerPagination({ resetKey: debouncedSearch });

  const {
    cardMisseds,
    totalCount,
    totalPages,
    serverPageSize,
    isLoading,
    isError,
    error,
    isPlaceholderData,
  } = useCardMissedQuery({ pageNumber, pageSize, searchTerm: debouncedSearch });

  lockPageSize(serverPageSize);

  const closeForm = () => {
    setIsFormOpen(false);
    clearServerErrors();
  };

  const { createMutation, deleteMutation, isSaving, serverErrors, clearServerErrors } =
    useCardMissedMutations({
      onCreateSuccess: closeForm,
      onDeleteSuccess: () => setItemToDelete(null),
    });

  const openAddForm = () => setIsFormOpen(true);

  const handleSave = (payload) => {
    createMutation.mutate(payload);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  const hasActiveFilters = !!search;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-2xl">Missed / Damaged Cards</h1>
          <p className="mt-1 text-sm text-slate-500 sm:sm-sm">
            Track and report missing or damaged cards.
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
        <CardMissedFilters searchTerm={search} onSearchChange={setSearch} />

        {isLoading && (
          <p className="p-8 text-center text-sm text-slate-400">Loading records...</p>
        )}

        {isError && (
          <p className="p-8 text-center text-sm text-red-500">
            {error?.message || "Failed to load records."}
          </p>
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