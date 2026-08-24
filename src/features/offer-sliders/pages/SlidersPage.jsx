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

  const { data, isLoading } = useSlidersQuery({
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
    setIsFormOpen(true);
  };

  const handleOpenEdit = (slider) => {
    setSliderToEdit(slider);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSliderToEdit(null);
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
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sliders
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage homepage banner sliders in both languages.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2.5 rounded-md"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Slider
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <SlidersFilters
            search={search}
            onSearchChange={setSearch}
            totalCount={data?.totalCount ?? 0}
          />
        </div>

        <SlidersTable
          sliders={data?.items ?? []}
          isLoading={isLoading}
          onView={handleView}
          onEdit={handleOpenEdit}
          onDelete={setSliderToDelete}
        />

        {(data?.totalPages ?? 0) > 1 && (
          <div className="p-4 border-t border-gray-100">
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