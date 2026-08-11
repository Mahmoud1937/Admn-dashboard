import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import {useGovernoratesLookup} from "../hooks/useGovernoratesLookup"
import {useCitiesQuery} from "../hooks/useCitiesQuery"
import {useCityMutations} from "../hooks/useCityMutations"
import CitiesFilters from "../components/CitiesFilters"
import CitiesTable from "../components/CitiesTable";
import Pagination from "../../../shared/components/Pagination";
import CityFormModal from "../components/CityFormModal";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
export default function CitiesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [governorateFilter, setGovernorateFilter] = useState("");


  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [cityToDelete, setCityToDelete] = useState(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    lockPageSize,
    getPageNumbers,
  } = useServerPagination({ resetKey: `${debouncedSearch}-${governorateFilter}` });

  const { governorates } = useGovernoratesLookup ();

  const {
    cities,
    totalCount,
    totalPages,
    serverPageSize,
    isLoading,
    isError,
    error,
    isPlaceholderData,
  } = useCitiesQuery ({ pageNumber, pageSize, search: debouncedSearch, governorateFilter });

  lockPageSize(serverPageSize);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCity(null);
  };

  const { createMutation, updateMutation, deleteMutation, isSaving } = useCityMutations({
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

  const hasActiveFilters = !!(search || governorateFilter);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cities Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage all cities across the platform.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add City
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <CitiesFilters
          search={search}
          onSearchChange={setSearch}
          governorateFilter={governorateFilter}
          onGovernorateFilterChange={setGovernorateFilter}
          governorates={governorates}
        />

        {isLoading && (
          <p className="p-8 text-center text-sm text-slate-400">Loading cities...</p>
        )}

        {isError && (
          <p className="p-8 text-center text-sm text-red-500">
            {error?.message || "Failed to load cities."}
          </p>
        )}

        {!isLoading && !isError && (
          <div className={`transition-opacity ${isPlaceholderData ? "opacity-60" : "opacity-100"}`}>
            <CitiesTable
              cities={cities}
              hasActiveFilters={hasActiveFilters}
              onEdit={openEditForm}
              onDeleteRequest={setCityToDelete}
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
        governorates={governorates}
        onSave={handleSave}
        onClose={closeForm}
        isSaving={isSaving}
      />

      <ConfirmDeleteModal
        isOpen={!!cityToDelete}
        title="Delete City"
        message={`Are you sure you want to delete "${cityToDelete?.enName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setCityToDelete(null)}
      />
    </div>
  );
}