import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import Pagination from "../../../shared/components/Pagination";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import { useServiceCategoriesQuery } from "../hooks/useServiceCategoriesQuery";
import { useServiceCategoryMutations } from "../hooks/useServiceCategoryMutations";
import ServiceCategoryFormModal from "../components/ServiceCategoryFormModal";
import ServiceCategoriesFilters from "../components/ServiceCategoriesFilters";
import ServiceCategoriesTable from "../components/ServiceCategoriesTable";

export default function ServiceCategoriesPage() {
  const [search, setSearch] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    lockPageSize,
    getPageNumbers,
  } = useServerPagination({ resetKey: search });

  const {
    categories,
    totalCount,
    totalPages,
    serverPageSize,
    isLoading,
    isError,
    error,
    isPlaceholderData,
  } = useServiceCategoriesQuery({ pageNumber, pageSize, search });

  lockPageSize(serverPageSize);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
     clearServerErrors();
  };

  const { createMutation, updateMutation, deleteMutation, isSaving,serverErrors, clearServerErrors  } = useServiceCategoryMutations({
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

  // payload coming from ServiceCategoryFormModal: { id, arName, enName, image }
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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Service Categories Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage all service categories across the platform.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Service Category
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <ServiceCategoriesFilters search={search} onSearchChange={setSearch} />

        {isLoading && (
          <p className="p-8 text-center text-sm text-slate-400">Loading service categories...</p>
        )}

        {isError && (
          <p className="p-8 text-center text-sm text-red-500">
            {error?.message || "Failed to load service categories."}
          </p>
        )}

        {!isLoading && !isError && (
          <div className={`transition-opacity ${isPlaceholderData ? "opacity-60" : "opacity-100"}`}>
            <ServiceCategoriesTable
              categories={categories}
              hasActiveFilters={!!search}
              onEdit={openEditForm}
              onDeleteRequest={setCategoryToDelete}
            />

            {categories.length > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel="service categories"
                onGoToPage={(page) => goToPage(page, totalPages)}
                onPageSizeChange={handlePageSizeChange}
                getPageNumbers={getPageNumbers}
              />
            )}
          </div>
        )}
      </div>

<ServiceCategoryFormModal
  isOpen={isFormOpen}
  category={editingCategory}
  onSave={handleSave}
  onClose={closeForm}
  isSaving={isSaving}
  serverErrors={serverErrors}
/>
      <ConfirmDeleteModal
        isOpen={!!categoryToDelete}
        title="Delete Service Category"
        message={`Are you sure you want to delete "${categoryToDelete?.enName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
}