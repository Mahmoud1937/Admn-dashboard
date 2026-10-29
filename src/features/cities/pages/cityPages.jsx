import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import useFilterPanel from "../../../shared/hooks/useFilterPanel";
import SearchBarWithFilters from "../../../shared/components/SearchBarWithFilters";

import { useCitiesQuery } from "../hooks/useCitiesQuery";
import { useCityMutations } from "../hooks/useCityMutations";
import CitiesFilters from "../components/CitiesFilters";
import CitiesTable from "../components/CitiesTable";
import Pagination from "../../../shared/components/Pagination";
import CityFormModal from "../components/CityFormModal";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import PermissionGuard from "../../auth/components/PermissionGuard";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import usePermission from "../../auth/hooks/usePermission";

const EMPTY_FILTERS = { governorateId: "" };

export default function CitiesPage() {
  const canUpdate = usePermission(PERMISSION_CODES.CITIES_UPDATE);
  const canDelete = usePermission(PERMISSION_CODES.CITIES_DELETE);
  const [search, setSearch] = useState("");
  const searchTerm = useDebouncedValue(search.trim(), 400);
  const {
    isOpen: isFilterOpen,
    filters,
    draft,
    setDraft,
    panelRef,
    triggerRef,
    toggle: toggleFilters,
    close: closeFilters,
    apply: applyFilters,
    clear: clearFilters,
  } = useFilterPanel({ emptyFilters: EMPTY_FILTERS });
  const governorateFilter = filters.governorateId;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [cityToDelete, setCityToDelete] = useState(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination({ resetKey: `${searchTerm}-${governorateFilter}` });

  const {
    cities,
    totalCount,
    totalPages,
    isLoading,
    isError,
    error,
    isPlaceholderData,
    refetch,
  } = useCitiesQuery({ pageNumber, pageSize, search: searchTerm, governorateFilter });

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCity(null);
    clearServerErrors();
  };

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    isSaving,
    serverErrors,
    clearServerErrors,
  } = useCityMutations({
    onCreateSuccess: closeForm,
    onUpdateSuccess: closeForm,
    onDeleteSuccess: () => setCityToDelete(null),
  });

  const openAddForm = () => {
    setEditingCity(null);
    setIsFormOpen(true);
  };

  const openEditForm = (city) => {
    setEditingCity(city);
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
    if (cityToDelete) {
      deleteMutation.mutate(cityToDelete.id);
    }
  };

  const hasActiveFilters = !!(searchTerm || governorateFilter);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-2xl">Cities Management</h1>
          <p className="mt-1 text-sm text-slate-500 sm:sm-sm">
            Manage all cities across the platform.
          </p>
        </div>

        <PermissionGuard permission={PERMISSION_CODES.CITIES_CREATE}>
          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add City
          </button>
        </PermissionGuard>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="relative">
          <SearchBarWithFilters
            value={search}
            onChange={setSearch}
            placeholder="Search cities by name (EN/AR)..."
            onFilterClick={toggleFilters}
            filterButtonRef={triggerRef}
            activeFilterCount={governorateFilter ? 1 : 0}
          />
          {isFilterOpen && (
            <CitiesFilters
              draft={draft}
              onChange={setDraft}
              onApply={applyFilters}
              onClear={clearFilters}
              onClose={closeFilters}
              panelRef={panelRef}
            />
          )}
        </div>

        {isLoading && (
          <p className="p-8 text-center text-sm text-slate-400">Loading cities...</p>
        )}

{isError && (
  <QueryErrorState
    title="Unable to load cities"
    error={error}
    onRetry={refetch}
  />
)}

        {!isLoading && !isError && (
          <div className={`transition-opacity ${isPlaceholderData ? "opacity-60" : "opacity-100"}`}>
            <CitiesTable
              cities={cities}
              hasActiveFilters={hasActiveFilters}
                onEdit={canUpdate ? openEditForm : undefined}
              onDeleteRequest={canDelete ? setCityToDelete : undefined}
            />

            {cities.length > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel="cities"
                onGoToPage={(page) => goToPage(page, totalPages)}
                onPageSizeChange={handlePageSizeChange}
                getPageNumbers={getPageNumbers}
              />
            )}
          </div>
        )}
      </div>

      <CityFormModal
        isOpen={isFormOpen}
        city={editingCity}
        onSave={handleSave}
        onClose={closeForm}
        isSaving={isSaving}
        serverErrors={serverErrors}
      />

      {canDelete && <ConfirmDeleteModal
        isOpen={!!cityToDelete}
        title="Delete City"
        message={`Are you sure you want to delete "${cityToDelete?.enName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setCityToDelete(null)}
      />}
    </div>
  );
}
