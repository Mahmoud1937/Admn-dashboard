import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft, faPaperclip, faPenToSquare, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useProviderRenewalsQuery } from "../hooks/useProviderRenewalsQuery";
import { useProviderRenewalCreateMutation } from "../hooks/useProviderRenewalCreateMutation";
import { useProviderRenewalUpdateMutation } from "../hooks/useProviderRenewalUpdateMutation";
import ProviderRenewalFormModal from "./ProviderRenewalFormModal";
import ProviderAttachmentsModal from "../../providerAttachments/components/ProviderAttachmentsModal";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import Pagination from "../../../shared/components/Pagination";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import { formatDate } from "../../../utils/formatDate";

const formatContractDate = (value) =>
  value && !Number.isNaN(new Date(value).getTime()) ? formatDate(value) : "-";

function RenewalsSkeleton() {
  return (
    <div role="status" className="space-y-4 p-6">
      <span className="sr-only">Loading renewals...</span>
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="h-10 animate-pulse rounded-lg bg-slate-100"
        />
      ))}
    </div>
  );
}

export default function ProviderRenewalsTab({
  providerId,
  canUploadAttachments = false,
  canCreateRenewals = false,
  canUpdateRenewals = false,
  canSelectBroker = false,
}) {
  const [selectedRenewalId, setSelectedRenewalId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRenewal, setEditingRenewal] = useState(null);
  const createMutation = useProviderRenewalCreateMutation({ providerId });
  const updateMutation = useProviderRenewalUpdateMutation({ providerId });
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const hasOpenRenewalForm = isCreateModalOpen || editingRenewal !== null;
  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination({ resetKey: providerId, initialPageSize: 15 });

  const {
    renewals,
    totalCount,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
  } = useProviderRenewalsQuery({ providerId, pageNumber, pageSize });

  const resetFeedback = () => {
    createMutation.reset();
    updateMutation.reset();
  };

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Renewals</h2>
          <p className="text-sm text-slate-500">
            {isLoading || isError
              ? "View this provider's contract renewal history."
              : `${totalCount} ${totalCount === 1 ? "renewal" : "renewals"} in total`}
          </p>
        </div>
        {canCreateRenewals && (
          <button
            type="button"
            disabled={!providerId || isSaving || hasOpenRenewalForm}
            onClick={() => {
              if (isSaving || hasOpenRenewalForm) return;
              resetFeedback();
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add renewal
          </button>
        )}
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <RenewalsSkeleton />
        ) : isError ? (
          <QueryErrorState
            title="Unable to load renewals"
            error={error}
            onRetry={refetch}
          />
        ) : renewals.length === 0 ? (
          <TableEmptyState
            icon={faClockRotateLeft}
            title="No renewals found"
            emptyMessage="No contract renewals have been recorded for this provider yet."
          />
        ) : (
          <>
            <ScrollableTable>
              <table className={`w-full text-left text-sm ${canUpdateRenewals ? "min-w-[950px]" : "min-w-[850px]"}`}>
                <caption className="sr-only">Provider contract renewals</caption>
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-100 text-xs font-medium text-slate-500">
                    <th scope="col" className="px-6 py-3">Renewal ID</th>
                    <th scope="col" className="px-4 py-3">Contract start</th>
                    <th scope="col" className="px-4 py-3">Contract end</th>
                    <th scope="col" className="px-4 py-3">Broker name</th>
                    <th scope="col" className="px-6 py-3">Broker phone</th>
                    <th scope="col" className="px-6 py-3">Attachments</th>
                    {canUpdateRenewals && <th scope="col" className="px-6 py-3">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {renewals.map((renewal) => (
                    <tr key={renewal.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-3.5 font-semibold text-slate-900">
                        #{renewal.id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                        {formatContractDate(renewal.contractStartAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                        {formatContractDate(renewal.contractEndAt)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {renewal.brokerName || "Not provided"}
                      </td>
                      <td dir="ltr" className="whitespace-nowrap px-6 py-3.5 tabular-nums text-slate-600">
                        {renewal.brokerPhone || "Not provided"}
                      </td>
                      <td className="px-6 py-3.5">
                        <button
                          type="button"
                          disabled={isSaving || hasOpenRenewalForm}
                          onClick={() => {
                            resetFeedback();
                            setSelectedRenewalId(renewal.id);
                          }}
                          aria-label={`View attachments for renewal #${renewal.id}`}
                          className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800 transition hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FontAwesomeIcon icon={faPaperclip} />
                          View attachments
                        </button>
                      </td>
                      {canUpdateRenewals && (
                        <td className="px-6 py-3.5">
                          <button
                            type="button"
                            disabled={isSaving || hasOpenRenewalForm}
                            onClick={() => {
                              if (isSaving || hasOpenRenewalForm) return;
                              resetFeedback();
                              setEditingRenewal(renewal);
                            }}
                            aria-label={`Edit renewal #${renewal.id}`}
                            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
                            Edit dates
                          </button>
                        </td>
                      )}
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
              itemLabel="renewals"
              getPageNumbers={getPageNumbers}
              onGoToPage={(page) => goToPage(page, totalPages)}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </div>

      {isCreateModalOpen && canCreateRenewals && (
        <ProviderRenewalFormModal
          mutation={createMutation}
          canSelectBroker={canSelectBroker}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {editingRenewal && canUpdateRenewals && (
        <ProviderRenewalFormModal
          key={editingRenewal.id}
          renewal={editingRenewal}
          mutation={updateMutation}
          onClose={() => setEditingRenewal(null)}
        />
      )}

      {selectedRenewalId !== null && (
        <ProviderAttachmentsModal
          key={selectedRenewalId}
          providerRenewalId={selectedRenewalId}
          canUpload={canUploadAttachments}
          onClose={() => setSelectedRenewalId(null)}
        />
      )}
    </div>
  );
}
