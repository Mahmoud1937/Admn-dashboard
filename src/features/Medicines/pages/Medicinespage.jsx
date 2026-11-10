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
import QueryErrorState from "../../../shared/components/QueryErrorState";
import PermissionGuard from "../../auth/components/PermissionGuard";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import usePermission from "../../auth/hooks/usePermission";
import { SkeletonTable } from "../../../shared/components/Skeleton";
import LocalizedPage from "../../../localization/LocalizedPage";
import useLanguage from "../../../localization/useLanguage";
import useMedicinesText from "../../../localization/useMedicinesText";


export default function MedicinesPage() {
  const t = useMedicinesText();
  const { language, direction } = useLanguage();
  const rtl = direction === "rtl";
  const canUpdate = usePermission(PERMISSION_CODES.MEDICINES_UPDATE);
  const canDelete = usePermission(PERMISSION_CODES.MEDICINES_DELETE);
  const [search, setSearch] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [medicineToDelete, setMedicineToDelete] = useState(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination({ resetKey: search });

  const {
    medicines,
    totalCount,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    isPlaceholderData,
  } = useMedicinesQuery({ pageNumber, pageSize, search, language });


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
    t,
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
          unit: payload.unit,
          isLocal: payload.isLocal,
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
        unit: payload.unit,
        isLocal: payload.isLocal,
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
    <LocalizedPage>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-2x">{t("Medicines Management")}</h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-sm">
            {t("Manage all medicines across the platform.")}
          </p>
        </div>

        <PermissionGuard permission={PERMISSION_CODES.MEDICINES_CREATE}>
          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <FontAwesomeIcon icon={faPlus} />
            {t("Add Medicine")}
          </button>
        </PermissionGuard>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <MedicinesFilters
          search={search}
          onSearchChange={setSearch}
        />

        {isLoading && (
          <SkeletonTable label={t("Loading medicines...")} columns={6} />
        )}

{isError && (
  <QueryErrorState
    title={t("Unable to load medicines")}
    error={error}
    onRetry={refetch}
    loadErrorMessage={t("We couldn't load the data. Please try again.")}
    connectionErrorMessage={t("We couldn't connect to the server. Please check your internet connection and try again.")}
    retryLabel={t("Try Again")}
  />
)}
        {!isLoading && !isError && (
          <div className={`transition-opacity ${isPlaceholderData ? "opacity-60" : "opacity-100"}`}>
            <MedicinesTable
              medicines={medicines}
              rtl={rtl}
              hasActiveFilters={!!search}
              onEdit={canUpdate ? openEditForm : undefined}
              onDeleteRequest={canDelete ? setMedicineToDelete : undefined}
            />

            {medicines.length > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                summary={t("Showing page {{page}} of {{totalPages}} ({{count}} medicines)", { page: pageNumber, totalPages, count: totalCount })}
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

      <MedicineFormModal
        isOpen={isFormOpen}
        medicine={editingMedicine}
        onSave={handleSave}
        onClose={closeForm}
        isSaving={isSaving}
        serverErrors={serverErrors}
      />

      {canDelete && <ConfirmDeleteModal
        isOpen={!!medicineToDelete}
        title={t("Delete Medicine")}
        message={t('Are you sure you want to delete "{{name}}"? This action cannot be undone.', {
          name: rtl ? (medicineToDelete?.arName || medicineToDelete?.enName) : (medicineToDelete?.enName || medicineToDelete?.arName),
        })}
        confirmLabel={t("Delete")}
        cancelLabel={t("Cancel")}
        loadingLabel={t("Deleting...")}
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setMedicineToDelete(null)}
      />}
    </LocalizedPage>
  );
}
