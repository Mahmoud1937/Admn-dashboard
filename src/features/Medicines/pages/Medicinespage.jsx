import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { useMedicinesQuery } from "../hooks/Usemedicinesquery";
import { useMedicineMutations } from "../hooks/Usemedicinemutations";
import MedicinesFilters from "../components/Medicinesfilters";
import MedicinesTable from "../components/Medicinestable";
import Pagination from "../../../shared/components/Pagination";
import MedicineFormModal from "../components/Medicineformmodal";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";


export default function MedicinesPage() {
  const [search, setSearch] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [medicineToDelete, setMedicineToDelete] = useState(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    lockPageSize,
    getPageNumbers,
  } = useServerPagination({ resetKey: search });

  const {
    medicines,
    totalCount,
    totalPages,
    serverPageSize,
    isLoading,
    isError,
    error,
    isPlaceholderData,
  } = useMedicinesQuery({ pageNumber, pageSize, search });

  lockPageSize(serverPageSize);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingMedicine(null);
    clearServerErrors();
  };

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    isSaving,
    serverErrors,
    clearServerErrors,
  } = useMedicineMutations({
    onCreateSuccess: closeForm,
    onUpdateSuccess: closeForm,
    onDeleteSuccess: () => setMedicineToDelete(null),
  });

  const openAddForm = () => {
    setEditingMedicine(null);
    clearServerErrors();
    setIsFormOpen(true);
  };

  const openEditForm = (medicine) => {
    setEditingMedicine(medicine);
    clearServerErrors();
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
          medicinePrice: payload.medicinePrice,
          medicineForm: payload.medicineForm,
          isUpdatedImage,
          imageFile: payload.image,
        },
      });
    } else {
      createMutation.mutate({
        arName: payload.arName,
        enName: payload.enName,
        medicinePrice: payload.medicinePrice,
        medicineForm: payload.medicineForm,
        imageFile: payload.image,
      });
    }
  };

  const confirmDelete = () => {
    if (medicineToDelete) {
      deleteMutation.mutate(medicineToDelete.id);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medicines Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage all medicines across the platform.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Medicine
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <MedicinesFilters
          search={search}
          onSearchChange={setSearch}
        />

        {isLoading && (
          <p className="p-8 text-center text-sm text-slate-400">Loading medicines...</p>
        )}

        {isError && (
          <p className="p-8 text-center text-sm text-red-500">
            {error?.message || "Failed to load medicines."}
          </p>
        )}

        {!isLoading && !isError && (
          <div className={`transition-opacity ${isPlaceholderData ? "opacity-60" : "opacity-100"}`}>
            <MedicinesTable
              medicines={medicines}
              hasActiveFilters={!!search}
              onEdit={openEditForm}
              onDeleteRequest={setMedicineToDelete}
            />

            {medicines.length > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel="medicines"
                onGoToPage={(page) => goToPage(page, totalPages)}
                onPageSizeChange={handlePageSizeChange}
                getPageNumbers={getPageNumbers}
              />
            )}
          </div>
        )}
      </div>

      <MedicineFormModal
        isOpen={isFormOpen}
        medicine={editingMedicine}
        onSave={handleSave}
        onClose={closeForm}
        isSaving={isSaving}
        serverErrors={serverErrors}
      />

      <ConfirmDeleteModal
        isOpen={!!medicineToDelete}
        title="Delete Medicine"
        message={`Are you sure you want to delete "${medicineToDelete?.enName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setMedicineToDelete(null)}
      />
    </div>
  );
}