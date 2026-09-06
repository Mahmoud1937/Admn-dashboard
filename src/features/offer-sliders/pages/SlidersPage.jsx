import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { useSliderMutations } from "../hooks/useSliderMutations";
import { useSlidersQuery } from "../hooks/useSlidersQuery";

import SlidersFilters from "../components/SlidersFilters";
import SlidersTable from "../components/SlidersTable";

import Pagination from "../../../shared/components/Pagination";
import SliderFormModal from "../components/SliderFormModal";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import QueryErrorState from "../../../shared/components/QueryErrorState";

const SlidersPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sliderToEdit, setSliderToEdit] = useState(null);
  const [sliderToDelete, setSliderToDelete] = useState(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    lockPageSize,
    getPageNumbers,
  } = useServerPagination({ resetKey: search });

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useSlidersQuery({
    pageNumber,
    pageSize,
    search,
  });

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    serverErrors,
    clearServerErrors,
  } = useSliderMutations();

  lockPageSize(data?.pageSize);

  const handleOpenAdd = () => {
    setSliderToEdit(null);
    clearServerErrors();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (slider) => {
    setSliderToEdit(slider);
    clearServerErrors();
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSliderToEdit(null);
    clearServerErrors();
  };

  const handleView = (slider) => {
    navigate(`/offer-sliders/${slider.id}`);
  };

  const handleFormSubmit = (values) => {
    if (sliderToEdit) {
      updateMutation.mutate(values, {
        onSuccess: handleCloseForm,
      });
    } else {
      createMutation.mutate(values, {
        onSuccess: handleCloseForm,
      });
    }
  };

  const confirmDelete = () => {
    if (!sliderToDelete) return;

    deleteMutation.mutate(sliderToDelete.id, {
      onSuccess: () => setSliderToDelete(null),
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Sliders
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage homepage banner sliders in both languages.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-900 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Slider
        </button>
      </div>

      {/* Sliders Card */}
      <div className="overflow-hidden rounded-lg border border-gray-100 bg-white">
        {/* Filters */}
        <div className="border-b border-gray-100 p-4">
          <SlidersFilters
            search={search}
            onSearchChange={setSearch}
            totalCount={data?.totalCount ?? 0}
          />
        </div>

        {/* Table / Error */}
        {isError ? (
          <QueryErrorState
            title="Unable to load sliders"
            error={error}
            onRetry={refetch}
          />
        ) : (
          <SlidersTable
            sliders={data?.items ?? []}
            isLoading={isLoading}
            onView={handleView}
            onEdit={handleOpenEdit}
            onDelete={setSliderToDelete}
          />
        )}

        {/* Pagination */}
        {!isError && (data?.totalPages ?? 0) > 1 && (
          <div className="border-t border-gray-100 p-4">
            <Pagination
              pageNumber={pageNumber}
              totalPages={data.totalPages}
              totalCount={data.totalCount}
              pageSize={pageSize}
              itemLabel="sliders"
              onGoToPage={(page) =>
                goToPage(page, data.totalPages)
              }
              onPageSizeChange={handlePageSizeChange}
              getPageNumbers={getPageNumbers}
            />
          </div>
        )}
      </div>

      {/* Create / Update Modal */}
      <SliderFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        isSaving={
          createMutation.isPending ||
          updateMutation.isPending
        }
        sliderToEdit={sliderToEdit}
        serverErrors={serverErrors}
        clearServerErrors={clearServerErrors}
      />

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        isOpen={!!sliderToDelete}
        onCancel={() => setSliderToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        title="Delete Slider"
        message={`Are you sure you want to delete the slider for "${sliderToDelete?.providerNameEn}"?`}
      />
    </div>
  );
};

export default SlidersPage;