import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import Pagination from "../../../shared/components/Pagination";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import { useServicesQuery } from "../hooks/UseServicesQuery";
import { useExportServices } from "../hooks/useExportServices";
import { useServiceMutations } from "../hooks/UseServiceMutations";
import ServiceFormModal from "../components/ServiceFormModal";
import ServicesFilters from "../components/ServicesFilters";
import ServicesTable from "../components/ServicesTable";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import PermissionGuard from "../../auth/components/PermissionGuard";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import usePermission from "../../auth/hooks/usePermission";
import { SkeletonTable } from "../../../shared/components/Skeleton";

export default function ServicesPage() {
  const canExport = usePermission(PERMISSION_CODES.SERVICES_READ);
  const { exportToExcel, isExporting, exportError } = useExportServices();
  const canUpdate = usePermission(PERMISSION_CODES.SERVICES_UPDATE);
  const canDelete = usePermission(PERMISSION_CODES.SERVICES_DELETE);
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
    getPageNumbers,
  } = useServerPagination({ resetKey: `${search}-${categoryFilter}` });

  const {
    services,
    totalCount,
    totalPages,
    isLoading,
    isError,
    error,
    isPlaceholderData,
    refetch
  } = useServicesQuery({ pageNumber, pageSize, search, categoryFilter });

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingService(null);
    clearServerErrors();
  };

  const { createMutation, updateMutation, deleteMutation, isSaving, serverErrors, clearServerErrors } =
    useServiceMutations({
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

  const handleExport = () => {
    if (canExport) exportToExcel({ searchTerm: search, categoryId: categoryFilter || undefined });
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Services Management</h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Manage all services across the platform.
          </p>
        </div>

        <PermissionGuard permission={PERMISSION_CODES.SERVICES_CREATE}>
          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Service
          </button>
        </PermissionGuard>
      </div>

      {exportError && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {exportError}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <ServicesFilters
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
        >
          {canExport && (
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              aria-busy={isExporting}
              title="Export services to Excel"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FontAwesomeIcon icon={isExporting ? faSpinner : faFileExcel} spin={isExporting} />
              {isExporting ? "Exporting..." : "Export"}
            </button>
          )}
        </ServicesFilters>

        {isLoading && (
          <SkeletonTable label="Loading services..." columns={5} />
        )}

        {isError && (
<QueryErrorState
  title="Unable to load services"
  error={error}
  onRetry={refetch}
/>
        )}

        {!isLoading && !isError && (
          <div className={`transition-opacity ${isPlaceholderData ? "opacity-60" : "opacity-100"}`}>
            <ServicesTable
              services={services}
              hasActiveFilters={hasActiveFilters}
              onEdit={canUpdate ? openEditForm : undefined}
              onDeleteRequest={canDelete ? setServiceToDelete : undefined}
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
        onSave={handleSave}
        onClose={closeForm}
        isSaving={isSaving}
        serverErrors={serverErrors}
      />

      {canDelete && <ConfirmDeleteModal
        isOpen={!!serviceToDelete}
        title="Delete Service"
        message={`Are you sure you want to delete "${serviceToDelete?.enName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setServiceToDelete(null)}
      />}
    </div>
  );
}
