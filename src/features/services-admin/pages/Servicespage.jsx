import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import Pagination from "../../../shared/components/Pagination";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import { useServiceCategoriesLookup } from "../hooks/useServiceCategoriesLookup";
import { useServicesQuery } from "../hooks/useServicesQuery";
import { useServiceMutations } from "../hooks/useServiceMutations";
import ServiceFormModal from "../components/ServiceFormModal";
import ServicesFilters from "../components/ServicesFilters";
import ServicesTable from "../components/ServicesTable";

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    lockPageSize,
    getPageNumbers,
  } = useServerPagination({ resetKey: `${search}-${categoryFilter}` });

  const { categories } = useServiceCategoriesLookup();

  const {
    services,
    totalCount,
    totalPages,
    serverPageSize,
    isLoading,
    isError,
    error,
    isPlaceholderData,
  } = useServicesQuery({ pageNumber, pageSize, search, categoryFilter });

  lockPageSize(serverPageSize);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingService(null);
  };

  const { createMutation, updateMutation, deleteMutation, isSaving } = useServiceMutations({
    onCreateSuccess: closeForm,
    onUpdateSuccess: closeForm,
    onDeleteSuccess: () => setServiceToDelete(null),
  });

  const openAddForm = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };

  const openEditForm = (service) => {
    setEditingService(service);
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
    if (serviceToDelete) {
      deleteMutation.mutate(serviceToDelete.id);
    }
  };

  const hasActiveFilters = !!(search || categoryFilter);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Services Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage all services across the platform.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Service
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <ServicesFilters
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          categories={categories}
        />

        {isLoading && (
          <p className="p-8 text-center text-sm text-slate-400">Loading services...</p>
        )}

        {isError && (
          <p className="p-8 text-center text-sm text-red-500">
            {error?.message || "Failed to load services."}
          </p>
        )}

        {!isLoading && !isError && (
          <div className={`transition-opacity ${isPlaceholderData ? "opacity-60" : "opacity-100"}`}>
            <ServicesTable
              services={services}
              hasActiveFilters={hasActiveFilters}
              onEdit={openEditForm}
              onDeleteRequest={setServiceToDelete}
            />

            {services.length > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel="services"
                onGoToPage={(page) => goToPage(page, totalPages)}
                onPageSizeChange={handlePageSizeChange}
                getPageNumbers={getPageNumbers}
              />
            )}
          </div>
        )}
      </div>

      <ServiceFormModal
        isOpen={isFormOpen}
        service={editingService}
        categories={categories}
        onSave={handleSave}
        onClose={closeForm}
        isSaving={isSaving}
      />

      <ConfirmDeleteModal
        isOpen={!!serviceToDelete}
        title="Delete Service"
        message={`Are you sure you want to delete "${serviceToDelete?.enName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setServiceToDelete(null)}
      />
    </div>
  );
}