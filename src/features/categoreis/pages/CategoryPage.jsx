import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../service/categoryService";
import toast from "react-hot-toast";
import Pagination from "../../../shared/components/Pagination";
import CategoryFormModal from "../components/CategoryFormModal";
import CategoriesTable from "../components/CategoriesTable";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";


export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [serverErrors, setServerErrors] = useState(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    lockPageSize,
    getPageNumbers,
  } = useServerPagination({ resetKey: search });

  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ["categories", pageNumber, pageSize, search],
    queryFn: () => getCategories(pageNumber, pageSize, search),
    placeholderData: (previousData) => previousData,
  });

  const categories = data?.data?.items ?? [];
  const totalCount = data?.data?.totalCount ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  lockPageSize(data?.data?.pageSize);

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Category created successfully.");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsFormOpen(false);
      setServerErrors(null);
    },
    onError: (err) => {
      const fieldErrors = err?.response?.data?.errors;
      if (fieldErrors) {
        setServerErrors(fieldErrors);
      } else {
        toast.error(err?.response?.data?.message || "Failed to create category.");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateCategory(id, payload),
    onSuccess: () => {
      toast.success("Category updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsFormOpen(false);
      setEditingCategory(null);
      setServerErrors(null);
    },
    onError: (err) => {
      const fieldErrors = err?.response?.data?.errors;
      if (fieldErrors) {
        setServerErrors(fieldErrors);
      } else {
        toast.error(err?.response?.data?.message || "Failed to update category.");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategoryToDelete(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete category.");
    },
  });

  const openAddForm = () => {
    setEditingCategory(null);
    setServerErrors(null);
    setIsFormOpen(true);
  };

  const openEditForm = (category) => {
    setEditingCategory(category);
    setServerErrors(null);
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

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const hasActiveFilters = !!search;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage all provider categories across the platform.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Category
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories by name (EN/AR)..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
            />
          </div>
        </div>

        {isLoading && (
          <p className="p-8 text-center text-sm text-slate-400">
            Loading categories...
          </p>
        )}

        {isError && (
          <p className="p-8 text-center text-sm text-red-500">
            {error?.message || "Failed to load categories."}
          </p>
        )}

        {!isLoading && !isError && (
          <div className={`transition-opacity ${isPlaceholderData ? "opacity-60" : "opacity-100"}`}>
            <CategoriesTable
              categories={categories}
              hasActiveFilters={hasActiveFilters}
              onEdit={openEditForm}
              onDeleteRequest={setCategoryToDelete}
            />

            {categories.length > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel="categories"
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
        onClose={() => {
          setIsFormOpen(false);
          setEditingCategory(null);
          setServerErrors(null);
        }}
        isSaving={isSaving}
        serverErrors={serverErrors}
      />

      <ConfirmDeleteModal
        isOpen={!!categoryToDelete}
        title="Delete Category"
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