import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePrescription, faRotateRight, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { formatDateTimeShort } from "../../../utils/formatDate";
import Pagination from "../../../shared/components/Pagination";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import { SkeletonTable } from "../../../shared/components/Skeleton";
import StatusBadge from "../../../shared/components/StatusBadge";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import { useManualPrescriptionsQuery } from "../hooks/useManualPrescriptionsQuery";
import PrescriptionDetailsSidebar from "../components/PrescriptionDetailsSidebar";
import ProcessPrescriptionModal from "../components/ProcessPrescriptionModal";
import RejectPrescriptionModal from "../components/RejectPrescriptionModal";
import { useProcessManualPrescriptionMutation } from "../hooks/useProcessManualPrescriptionMutation";
import { useRejectManualPrescriptionMutation } from "../hooks/useRejectManualPrescriptionMutation";
import usePermission from "../../auth/hooks/usePermission";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";

const statusTone = {
  Pending: "warning",
  Processed: "success",
  Rejected: "danger",
};

export default function PrescriptionsPage() {
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(null);
  const [processingPrescriptionId, setProcessingPrescriptionId] = useState(null);
  const [rejectingPrescriptionId, setRejectingPrescriptionId] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 400);
  const canViewClients = usePermission(PERMISSION_CODES.CLIENTS_READ);
  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination({ initialPageSize: 10, resetKey: `${status}|${search}` });
  const {
    prescriptions,
    totalCount,
    totalPages,
    isLoading,
    isError,
    isPlaceholderData,
    isFetching,
    error,
    refetch,
  } = useManualPrescriptionsQuery({ pageNumber, pageSize, status, search });
  const selectedPrescription = prescriptions.find(
    (prescription) => prescription.id === selectedPrescriptionId
  );
  const processingPrescription = prescriptions.find(
    (prescription) => prescription.id === processingPrescriptionId
  );
  const rejectingPrescription = prescriptions.find(
    (prescription) => prescription.id === rejectingPrescriptionId
  );
  const processMutation = useProcessManualPrescriptionMutation({
    onSuccess: () => setProcessingPrescriptionId(null),
  });
  const rejectMutation = useRejectManualPrescriptionMutation({
    onSuccess: () => setRejectingPrescriptionId(null),
  });

  const openProcess = (id) => {
    processMutation.reset();
    setSelectedPrescriptionId(null);
    setProcessingPrescriptionId(id);
  };

  const closeProcess = () => {
    if (processMutation.isPending) return;
    processMutation.reset();
    setProcessingPrescriptionId(null);
  };

  const openReject = (id) => {
    rejectMutation.reset();
    setSelectedPrescriptionId(null);
    setRejectingPrescriptionId(id);
  };

  const closeReject = () => {
    if (rejectMutation.isPending) return;
    rejectMutation.reset();
    setRejectingPrescriptionId(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prescriptions</h1>
          <p className="mt-1 text-sm text-slate-500">Review manual prescriptions submitted by customers.</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faRotateRight} spin={isFetching} />
          Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search prescriptions</span>
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search prescriptions..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span>Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="min-w-40 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
            >
              <option value="">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processed">Processed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </label>
        </div>
        {isLoading ? (
          <SkeletonTable label="Loading prescriptions..." columns={6} />
        ) : isError ? (
          <QueryErrorState title="Unable to load prescriptions" error={error} onRetry={refetch} />
        ) : prescriptions.length === 0 ? (
          <TableEmptyState
            icon={faFilePrescription}
            title="No prescriptions found"
            emptyMessage={status || search
              ? "No prescriptions match the current filters."
              : "Submitted prescriptions will appear here."}
          />
        ) : (
          <div className={isPlaceholderData ? "opacity-60" : "opacity-100"}>
            <ScrollableTable maxHeight="65vh">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-100">
                  <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-700">
                    <th scope="col" className="px-5 py-3">ID</th>
                    <th scope="col" className="px-5 py-3">Customer</th>
                    <th scope="col" className="px-5 py-3">Prescription text</th>
                    <th scope="col" className="px-5 py-3">Status</th>
                    <th scope="col" className="px-5 py-3">Submitted</th>
                    <th scope="col" className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescriptions.map((prescription) => (
                    <tr key={prescription.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium tabular-nums text-slate-700">#{prescription.id}</td>
                      <td className="px-5 py-4">
                        {canViewClients ? (
                          <Link
                            to={`/clients/${prescription.customerId}`}
                            className="font-medium text-slate-900 hover:text-blue-800 hover:underline"
                            dir="auto"
                          >
                            {prescription.customerFullName || `Customer #${prescription.customerId}`}
                          </Link>
                        ) : (
                          <span className="font-medium text-slate-900" dir="auto">
                            {prescription.customerFullName || `Customer #${prescription.customerId}`}
                          </span>
                        )}
                        <p className="mt-0.5 text-xs tabular-nums text-slate-500">{prescription.phoneNumber || "—"}</p>
                      </td>
                      <td className="max-w-[260px] px-5 py-4">
                        <p className="truncate text-slate-700" dir="auto" title={prescription.text || ""}>
                          {prescription.text || (prescription.imageUrl ? "Image attached" : "—")}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge tone={statusTone[prescription.status] || "neutral"}>
                          {prescription.status || "Unknown"}
                        </StatusBadge>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatDateTimeShort(prescription.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedPrescriptionId(prescription.id)}
                          className="rounded-lg px-3 py-1.5 font-medium text-blue-800 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                        >
                          View
                        </button>
                        {prescription.status === "Pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() => openProcess(prescription.id)}
                              className="ml-1 rounded-lg px-3 py-1.5 font-medium text-emerald-700 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                            >
                              Process
                            </button>
                            <button
                              type="button"
                              onClick={() => openReject(prescription.id)}
                              className="ml-1 rounded-lg px-3 py-1.5 font-medium text-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollableTable>
            <Pagination
              pageNumber={pageNumber}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              itemLabel="prescriptions"
              onGoToPage={(page) => goToPage(page, totalPages)}
              onPageSizeChange={handlePageSizeChange}
              getPageNumbers={getPageNumbers}
            />
          </div>
        )}
      </div>

      {selectedPrescription && (
        <PrescriptionDetailsSidebar
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescriptionId(null)}
          onProcess={() => openProcess(selectedPrescription.id)}
          onReject={() => openReject(selectedPrescription.id)}
        />
      )}
      {processingPrescription && (
        <ProcessPrescriptionModal
          prescription={processingPrescription}
          onClose={closeProcess}
          onProcess={(payload) => processMutation.mutate(payload)}
          isSaving={processMutation.isPending}
          error={processMutation.error}
        />
      )}
      {rejectingPrescription && (
        <RejectPrescriptionModal
          prescription={rejectingPrescription}
          onClose={closeReject}
          onReject={(payload) => rejectMutation.mutate(payload)}
          isSaving={rejectMutation.isPending}
          error={rejectMutation.error}
        />
      )}
    </div>
  );
}
