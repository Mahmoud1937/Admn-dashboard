import LocalizedPage from "../../../localization/LocalizedPage";
import { useTranslation } from "react-i18next";
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
import PermissionGuard from "../../auth/components/PermissionGuard";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import usePermission from "../../auth/hooks/usePermission";
import { useSubscriptionTypeMutations } from "../hooks/useSubscriptionTypeMutations";
import { useSubscriptionTypesQuery } from "../hooks/useSubscriptionTypesQuery";
import { SkeletonTable } from "../../../shared/components/Skeleton";

export default function SubscriptionTypesPage() {
  const { t } = useTranslation("adminPages");
  const canUpdate = usePermission(PERMISSION_CODES.PLAN_TYPES_UPDATE);
  const canDelete = usePermission(PERMISSION_CODES.PLAN_TYPES_DELETE);
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
    toggleMutation,
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
    <LocalizedPage><div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            {t("Subscription Types Management")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("View and search subscription plan types across the platform.")}
          </p>
        </div>

        <PermissionGuard permission={PERMISSION_CODES.PLAN_TYPES_CREATE}>
          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <FontAwesomeIcon icon={faPlus} />
            {t("Add Subscription Type")}
          </button>
        </PermissionGuard>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <SubscriptionTypesFilters search={search} onSearchChange={setSearch} />

        {isLoading && (
          <SkeletonTable label={t("Loading subscription types...")} columns={6} />
        )}

        {isError && (
          <QueryErrorState
            title={t("Unable to load subscription types")}
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
              onEdit={canUpdate ? openEditForm : undefined}
              onDeleteRequest={canDelete ? setSubscriptionTypeToDelete : undefined}
              onToggleStatus={
                canUpdate
                  ? (subscriptionType) => toggleMutation.mutate(subscriptionType.id)
                  : undefined
              }
              togglingId={toggleMutation.isPending ? toggleMutation.variables : null}
            />

            {subscriptionTypes.length > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel={t("subscription types")}
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

      {canDelete && <ConfirmDeleteModal
        isOpen={!!subscriptionTypeToDelete}
        title={t("Delete Subscription Type")}
        message={`Are you sure you want to delete "${subscriptionTypeToDelete?.nameEn}"? This action cannot be undone.`}
        confirmLabel={t("Delete")}
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setSubscriptionTypeToDelete(null)}
      />}
    </div></LocalizedPage>
  );
}
