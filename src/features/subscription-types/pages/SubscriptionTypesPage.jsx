import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import Pagination from "../../../shared/components/Pagination";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import SubscriptionTypesFilters from "../components/SubscriptionTypesFilters";
import SubscriptionTypesTable from "../components/SubscriptionTypesTable";
import SubscriptionTypeFormModal from "../components/SubscriptionTypeFormModal";
import { useSubscriptionTypeMutations } from "../hooks/useSubscriptionTypeMutations";
import { useSubscriptionTypesQuery } from "../hooks/useSubscriptionTypesQuery";

export default function SubscriptionTypesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubscriptionType, setEditingSubscriptionType] = useState(null);
  const [subscriptionTypeToDelete, setSubscriptionTypeToDelete] = useState(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination({ resetKey: debouncedSearch });

  const {
    subscriptionTypes,
    totalCount,
    totalPages,
    isLoading,
    isError,
    error,
    isPlaceholderData,
    refetch,
  } = useSubscriptionTypesQuery({
    pageNumber,
    pageSize,
    search: debouncedSearch,
  });

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSubscriptionType(null);
    clearServerErrors();
  };

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    isSaving,
    serverErrors,
    clearServerErrors,
  } = useSubscriptionTypeMutations({
    onCreateSuccess: closeForm,
    onUpdateSuccess: closeForm,
    onDeleteSuccess: () => setSubscriptionTypeToDelete(null),
  });

  const openAddForm = () => {
    setEditingSubscriptionType(null);
    clearServerErrors();
    setIsFormOpen(true);
  };

  const openEditForm = (subscriptionType) => {
    setEditingSubscriptionType(subscriptionType);
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
    if (subscriptionTypeToDelete) {
      deleteMutation.mutate(subscriptionTypeToDelete.id);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Subscription Types Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and search subscription plan types across the platform.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Subscription Type
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <SubscriptionTypesFilters search={search} onSearchChange={setSearch} />

        {isLoading && (
          <p className="p-8 text-center text-sm text-slate-400">
            Loading subscription types...
          </p>
        )}

        {isError && (
          <QueryErrorState
            title="Unable to load subscription types"
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
            <SubscriptionTypesTable
              subscriptionTypes={subscriptionTypes}
              hasActiveFilters={!!debouncedSearch}
              onEdit={openEditForm}
              onDeleteRequest={setSubscriptionTypeToDelete}
            />

            {subscriptionTypes.length > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel="subscription types"
                onGoToPage={(page) => goToPage(page, totalPages)}
                onPageSizeChange={handlePageSizeChange}
                getPageNumbers={getPageNumbers}
              />
            )}
          </div>
        )}
      </div>

      <SubscriptionTypeFormModal
        isOpen={isFormOpen}
        subscriptionType={editingSubscriptionType}
        onSave={handleSave}
        onClose={closeForm}
        isSaving={isSaving}
        serverErrors={serverErrors}
      />

      <ConfirmDeleteModal
        isOpen={!!subscriptionTypeToDelete}
        title="Delete Subscription Type"
        message={`Are you sure you want to delete "${subscriptionTypeToDelete?.nameEn}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setSubscriptionTypeToDelete(null)}
      />
    </div>
  );
}
