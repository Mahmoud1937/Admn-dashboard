import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import Pagination from "../../../shared/components/Pagination";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import TicketTypesFilters from "../components/TicketTypesFilters";
import TicketTypesTable from "../components/TicketTypesTable";
import TicketTypeFormModal from "../components/TicketTypeFormModal";
import { useTicketTypeMutations } from "../hooks/useTicketTypeMutations";
import { useTicketTypesQuery } from "../hooks/useTicketTypesQuery";

export default function TicketTypesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTicketType, setEditingTicketType] = useState(null);
  const [ticketTypeToDelete, setTicketTypeToDelete] = useState(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination({ resetKey: debouncedSearch });

  const {
    ticketTypes,
    totalCount,
    totalPages,
    isLoading,
    isError,
    error,
    isPlaceholderData,
    refetch,
  } = useTicketTypesQuery({ pageNumber, pageSize, search: debouncedSearch });

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTicketType(null);
    clearServerErrors();
  };

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    isSaving,
    serverErrors,
    clearServerErrors,
  } = useTicketTypeMutations({
    onCreateSuccess: closeForm,
    onUpdateSuccess: closeForm,
    onDeleteSuccess: () => setTicketTypeToDelete(null),
  });

  const openAddForm = () => {
    setEditingTicketType(null);
    clearServerErrors();
    setIsFormOpen(true);
  };

  const openEditForm = (ticketType) => {
    setEditingTicketType(ticketType);
    clearServerErrors();
    setIsFormOpen(true);
  };

  const handleSave = (payload) => {
    if (payload.id) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const confirmDelete = () => {
    if (ticketTypeToDelete) {
      deleteMutation.mutate(ticketTypeToDelete.id);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Ticket Types Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and search support ticket types across the platform.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Ticket Type
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <TicketTypesFilters search={search} onSearchChange={setSearch} />

        {isLoading && (
          <p className="p-8 text-center text-sm text-slate-400">
            Loading ticket types...
          </p>
        )}

        {isError && (
          <QueryErrorState
            title="Unable to load ticket types"
            error={error}
            onRetry={refetch}
          />
        )}

        {!isLoading && !isError && (
          <div
            className={`transition-opacity ${
              isPlaceholderData ? "opacity-60" : "opacity-100"
            }`}
          >
            <TicketTypesTable
              ticketTypes={ticketTypes}
              hasActiveFilters={!!debouncedSearch}
              onEdit={openEditForm}
              onDeleteRequest={setTicketTypeToDelete}
            />

            {ticketTypes.length > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel="ticket types"
                onGoToPage={(page) => goToPage(page, totalPages)}
                onPageSizeChange={handlePageSizeChange}
                getPageNumbers={getPageNumbers}
              />
            )}
          </div>
        )}
      </div>

      <TicketTypeFormModal
        isOpen={isFormOpen}
        ticketType={editingTicketType}
        onSave={handleSave}
        onClose={closeForm}
        isSaving={isSaving}
        serverErrors={serverErrors}
      />

      <ConfirmDeleteModal
        isOpen={!!ticketTypeToDelete}
        title="Delete Ticket Type"
        message={`Are you sure you want to delete "${ticketTypeToDelete?.enName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setTicketTypeToDelete(null)}
      />
    </div>
  );
}
