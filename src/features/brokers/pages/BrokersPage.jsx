import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import SearchBarWithFilters from "../../../shared/components/SearchBarWithFilters";
import Pagination from "../../../shared/components/Pagination";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import AccessDeniedPage from "../../../shared/components/AccessDeniedPage";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import usePermission from "../../auth/hooks/usePermission";
import { useBrokersQuery } from "../hooks/useBrokersQuery";
import { useBrokerMutations } from "../hooks/useBrokerMutations";
import BrokersTable from "../components/BrokersTable";
import BrokerFormModal from "../components/BrokerFormModal";
import { SkeletonTable } from "../../../shared/components/Skeleton";

export default function BrokersPage() {
  const canRead = usePermission(PERMISSION_CODES.BROKERS_READ);
  const canCreate = usePermission(PERMISSION_CODES.BROKERS_CREATE);
  const canUpdate = usePermission(PERMISSION_CODES.BROKERS_UPDATE);
  const canDelete = usePermission(PERMISSION_CODES.BROKERS_DELETE);
  const [search, setSearch] = useState("");
  const searchTerm = useDebouncedValue(search, 400);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBroker, setEditingBroker] = useState(null);
  const [brokerToDelete, setBrokerToDelete] = useState(null);

  const { pageNumber, pageSize, setPageNumber, goToPage, handlePageSizeChange, getPageNumbers } =
    useServerPagination({ resetKey: searchTerm, initialPageSize: 15 });
  const { brokers, totalCount, totalPages, isLoading, isError, error, isPlaceholderData, refetch } =
    useBrokersQuery({ pageNumber, pageSize, searchTerm, enabled: canRead });

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingBroker(null);
    clearServerErrors();
  };

  const { createMutation, updateMutation, deleteMutation, isSaving, serverErrors, clearServerErrors } =
    useBrokerMutations({
      onSaveSuccess: closeForm,
      onDeleteSuccess: () => {
        setBrokerToDelete(null);
        if (brokers.length === 1 && pageNumber > 1) setPageNumber(pageNumber - 1);
      },
    });

  const openForm = (broker = null) => {
    if (broker ? !canUpdate : !canCreate) return;
    clearServerErrors();
    setEditingBroker(broker);
    setIsFormOpen(true);
  };

  const saveBroker = ({ id, ...values }) => {
    if (id) {
      if (canUpdate) updateMutation.mutate({ id, ...values });
    } else if (canCreate) {
      createMutation.mutate(values);
    }
  };

  if (!canRead || (isError && error?.response?.status === 403)) {
    return <AccessDeniedPage />;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Brokers Management</h1>
          <p className="mt-1 text-sm text-slate-500">View and manage brokers.</p>
        </div>
        {canCreate && (
          <button type="button" onClick={() => openForm()} className="flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800">
            <FontAwesomeIcon icon={faPlus} /> Add Broker
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <SearchBarWithFilters value={search} onChange={setSearch} placeholder="Search by name or phone number..." showFilterButton={false} />
        {isLoading && <SkeletonTable label="Loading brokers..." columns={4} />}
        {isError && error?.response?.status !== 403 && (
          <QueryErrorState title="Unable to load brokers" error={error} onRetry={refetch} />
        )}
        {!isLoading && !isError && (
          <div className={`transition-opacity ${isPlaceholderData ? "opacity-60" : "opacity-100"}`}>
            <BrokersTable
              brokers={brokers}
              searchTerm={searchTerm}
              onEdit={canUpdate ? openForm : undefined}
              onDelete={canDelete ? (broker) => {
                deleteMutation.reset();
                setBrokerToDelete(broker);
              } : undefined}
            />
            <Pagination
              pageNumber={pageNumber}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              itemLabel="brokers"
              onGoToPage={(page) => goToPage(page, totalPages)}
              onPageSizeChange={handlePageSizeChange}
              getPageNumbers={getPageNumbers}
            />
          </div>
        )}
      </div>

      {(canCreate || canUpdate) && (
        <BrokerFormModal
          isOpen={isFormOpen}
          broker={editingBroker}
          onSave={saveBroker}
          onClose={closeForm}
          isSaving={isSaving}
          serverErrors={serverErrors}
        />
      )}

      {canDelete && (
        <ConfirmDeleteModal
          isOpen={!!brokerToDelete}
          title="Delete Broker"
          message={`Are you sure you want to delete "${brokerToDelete?.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          isLoading={deleteMutation.isPending}
          onConfirm={() => brokerToDelete && deleteMutation.mutate(brokerToDelete.id)}
          onCancel={() => {
            deleteMutation.reset();
            setBrokerToDelete(null);
          }}
        />
      )}
    </div>
  );
}
