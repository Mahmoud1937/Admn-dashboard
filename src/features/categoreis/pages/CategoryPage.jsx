import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { useCategoriesQuery } from "../hooks/useCategoriesQuery";
import { useCategoryMutations } from "../hooks/useCategoryMutations";
import Pagination from "../../../shared/components/Pagination";
import CategoryFormModal from "../components/CategoryFormModal";
import CategoriesTable from "../components/CategoriesTable";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import PermissionGuard from "../../auth/components/PermissionGuard";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import usePermission from "../../auth/hooks/usePermission";
import { SkeletonTable } from "../../../shared/components/Skeleton";
import useLanguage from "../../../localization/useLanguage";
import LocalizedPage from "../../../localization/LocalizedPage";
import useProviderCategoriesText from "../../../localization/useProviderCategoriesText";

export default function CategoriesPage() {
  const t = useProviderCategoriesText();
  const { language, direction } = useLanguage();
  const rtl = direction === "rtl";
  const canUpdate = usePermission(PERMISSION_CODES.PROVIDER_CATEGORIES_UPDATE);
  const canDelete = usePermission(PERMISSION_CODES.PROVIDER_CATEGORIES_DELETE);
  const [search, setSearch] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination({ resetKey: search });

  const {
    categories,
    totalCount,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    isPlaceholderData,
  } = useCategoriesQuery({ pageNumber, pageSize, search, language });


  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    clearServerErrors();
  };

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    isSaving,
    serverErrors,
    clearServerErrors,
  } = useCategoryMutations({
    t,
    onCreateSuccess: closeForm,
    onUpdateSuccess: closeForm,
    onDeleteSuccess: () => setCategoryToDelete(null),
  });

  const openAddForm = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const openEditForm = (category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleSave = (payload) => {
    if (payload.id) {
      const isUpdatedImage = !!payload.image;

      updateMutation.mutate({
        id: payload.id,
        payload: {
          arName: payload.arName,
          enName: payload.enName,
          isUpdatedImage,
          logoFile: payload.image,
        },
      });
    } else {
      createMutation.mutate({
        arName: payload.arName,
        enName: payload.enName,
        logoFile: payload.image,
      });
    }
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id);
    }
  };

  const hasActiveFilters = !!search;

  return (
    <LocalizedPage>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{t("Categories Management")}</h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            {t("Manage all provider categories across the platform.")}
          </p>
        </div>

        <PermissionGuard permission={PERMISSION_CODES.PROVIDER_CATEGORIES_CREATE}>
          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <FontAwesomeIcon icon={faPlus} />
            {t("Add Category")}
          </button>
        </PermissionGuard>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${rtl ? "right-4" : "left-4"}`}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t("Search categories by name (EN/AR)...")}
              placeholder={t("Search categories by name (EN/AR)...")}
              className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white ${rtl ? "pr-11 pl-4" : "pl-11 pr-4"}`}
            />
          </div>
        </div>

        {isLoading && (
          <SkeletonTable label={t("Loading categories...")} columns={4} />
        )}

        {isError && (
          <QueryErrorState
            title={t("Unable to load Categories")}
            error={error}
            onRetry={refetch}
            loadErrorMessage={t("We couldn't load the data. Please try again.")}
            connectionErrorMessage={t("We couldn't connect to the server. Please check your internet connection and try again.")}
            retryLabel={t("Try Again")}
          />
        )}

        {!isLoading && !isError && (
          <div className={`transition-opacity ${isPlaceholderData ? "opacity-60" : "opacity-100"}`}>
            <CategoriesTable
              categories={categories}
              rtl={rtl}
              hasActiveFilters={hasActiveFilters}
              onEdit={canUpdate ? openEditForm : undefined}
              onDeleteRequest={canDelete ? setCategoryToDelete : undefined}
            />

            {categories.length > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel={t("categories")}
                summary={t("Showing page {{page}} of {{totalPages}} ({{count}} categories)", { page: pageNumber, totalPages, count: totalCount })}
                rowsPerPageLabel={t("Rows per page")}
                previousLabel={t("Previous")}
                nextLabel={t("Next")}
                rtl={rtl}
                onGoToPage={(page) => goToPage(page, totalPages)}
                onPageSizeChange={handlePageSizeChange}
                getPageNumbers={getPageNumbers}
              />
            )}
          </div>
        )}
      </div>

      <CategoryFormModal
        isOpen={isFormOpen}
        category={editingCategory}
        onSave={handleSave}
        onClose={closeForm}
        isSaving={isSaving}
        serverErrors={serverErrors}
      />

      {canDelete && <ConfirmDeleteModal
        isOpen={!!categoryToDelete}
        title={t("Delete Category")}
        message={t('Are you sure you want to delete "{{name}}"? This action cannot be undone.', {
          name: rtl ? (categoryToDelete?.arName || categoryToDelete?.enName) : (categoryToDelete?.enName || categoryToDelete?.arName),
        })}
        confirmLabel={t("Delete")}
        cancelLabel={t("Cancel")}
        loadingLabel={t("Deleting...")}
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setCategoryToDelete(null)}
      />}
    </LocalizedPage>
  );
}
