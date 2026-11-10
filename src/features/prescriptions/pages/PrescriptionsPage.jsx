import TableActionsCell from "../../../shared/components/TableActionsCell";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePrescription, faRotateRight, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { formatDateTimeShort } from "../../../utils/formatDate";
import Pagination from "../../../shared/components/Pagination";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import { SkeletonTable } from "../../../shared/components/Skeleton";
import PrescriptionStatusBadge from "../components/PrescriptionStatusBadge";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import { useManualPrescriptionsQuery } from "../hooks/useManualPrescriptionsQuery";
import LocalizedPage from "../../../localization/LocalizedPage";
import useLanguage from "../../../localization/useLanguage";
import usePrescriptionsText from "../../../localization/usePrescriptionsText";

export default function PrescriptionsPage() {
  const t = usePrescriptionsText();
  const { language, direction } = useLanguage();
  const rtl = direction === "rtl";
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 400);
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
  } = useManualPrescriptionsQuery({ pageNumber, pageSize, status, search, language });

  const openDetails = (prescription, action) => {
    const search = action ? `?action=${action}` : "";
    navigate(`/prescriptions/${prescription.id}${search}`);
  };

  return (
    <LocalizedPage>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("Prescriptions")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("Review manual prescriptions submitted by customers.")}</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faRotateRight} spin={isFetching} />
          {t("Refresh")}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">{t("Search prescriptions")}</span>
            <FontAwesomeIcon
              icon={faSearch}
              className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${rtl ? "right-4" : "left-4"}`}
            />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t("Search prescriptions...")}
              style={rtl ? { direction: "rtl", textAlign: "right" } : undefined}
              className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white ${rtl ? "pr-11 pl-4" : "pl-11 pr-4"}`}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span>{t("Status")}</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="min-w-40 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
            >
              <option value="">{t("All statuses")}</option>
              <option value="Pending">{t("Pending")}</option>
              <option value="Processed">{t("Processed")}</option>
              <option value="Rejected">{t("Rejected")}</option>
            </select>
          </label>
        </div>
        {isLoading ? (
          <SkeletonTable label={t("Loading prescriptions...")} columns={7} />
        ) : isError ? (
          <QueryErrorState title={t("Unable to load prescriptions")} error={error} onRetry={refetch}
            loadErrorMessage={t("We couldn't load the data. Please try again.")}
            connectionErrorMessage={t("We couldn't connect to the server. Please check your internet connection and try again.")}
            retryLabel={t("Try Again")} />
        ) : prescriptions.length === 0 ? (
          <TableEmptyState
            icon={faFilePrescription}
            title={t("No prescriptions found")}
            emptyMessage={status || search
              ? t("No prescriptions match the current filters.")
              : t("Submitted prescriptions will appear here.")}
          />
        ) : (
          <div className={isPlaceholderData ? "opacity-60" : "opacity-100"}>
            <ScrollableTable maxHeight="65vh">
              <table dir={direction} className="w-full min-w-[1080px] table-fixed text-start text-sm [&_td]:text-start [&_td]:align-top">
                <caption className="sr-only">{t("Manual prescriptions")}</caption>
                <colgroup>
                  <col className="w-[7%]" />
                  <col className="w-[18%]" />
                  <col className="w-[17%]" />
                  <col className="w-[12%]" />
                  <col className="w-[19%]" />
                  <col className="w-[12%]" />
                  <col className="w-[15%]" />
                </colgroup>
                <thead className="sticky top-0 z-10 bg-slate-50">
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                    <th scope="col" className="px-4 py-3.5 text-start">{t("ID")}</th>
                    <th scope="col" className="px-4 py-3.5 text-start">{t("Customer")}</th>
                    <th scope="col" className="px-4 py-3.5 text-start">{t("Prescription text")}</th>
                    <th scope="col" className="px-4 py-3.5 text-start">{t("Status")}</th>
                    <th scope="col" className="px-4 py-3.5 text-right">{t("Rejection reason")}</th>
                    <th scope="col" className="px-4 py-3.5 text-start">{t("Submitted")}</th>
                    <TableActionsCell as="th" side={rtl ? "left" : "right"} scope="col" className="px-4 py-3.5 text-start">{t("Actions")}</TableActionsCell>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescriptions.map((prescription) => (
                    <tr
                      key={prescription.id}
                      tabIndex={0}
                      aria-label={t("Open prescription #{{id}} details", { id: prescription.id })}
                      onClick={(event) => {
                        if (!event.target.closest("a, button, input, select, textarea, [data-no-row-navigation]")) openDetails(prescription);
                      }}
                      onKeyDown={(event) => {
                        if (event.target === event.currentTarget && ["Enter", " "].includes(event.key)) {
                          event.preventDefault();
                          openDetails(prescription);
                        }
                      }}
                      className="cursor-pointer transition-colors hover:bg-blue-50/40 focus:outline-none focus-visible:bg-blue-50/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400"
                    >
                      <td className="px-4 py-4 font-medium tabular-nums text-slate-500">
                        <Link to={`/prescriptions/${prescription.id}`} className="hover:text-blue-800 hover:underline">
                          #{prescription.id}
                        </Link>
                      </td>
                      <td data-no-row-navigation className="cursor-default px-4 py-4">
                        <span className={`block cursor-text truncate font-semibold text-slate-900 ${rtl ? "text-right" : "text-left"}`} dir="auto" title={prescription.customerFullName || ""}>
                          {prescription.customerFullName || t("Customer #{{id}}", { id: prescription.customerId })}
                        </span>
                        <p dir="ltr" className={`mt-1 text-xs tabular-nums text-slate-500 ${rtl ? "text-right" : "text-left"}`}>{prescription.phoneNumber || "—"}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="line-clamp-2 whitespace-pre-wrap break-words text-start leading-6 text-slate-600" dir="auto" title={prescription.text || ""}>
                          {prescription.text || (prescription.imageUrl ? t("Image attached") : "—")}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <PrescriptionStatusBadge status={prescription.status} />
                      </td>
                      <td className="px-4 py-4">
                        <p dir="auto" className={`whitespace-pre-wrap break-words text-right leading-6 ${prescription.rejectionReason ? "text-red-700" : "text-slate-300"}`}>
                          {prescription.rejectionReason || "—"}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-xs leading-6 tabular-nums text-slate-500">
                        {formatDateTimeShort(prescription.createdAt)}
                      </td>
                      <TableActionsCell side={rtl ? "left" : "right"} hoverColor="color-mix(in oklab, var(--color-blue-50) 40%, transparent)" className="px-4 py-4">
                        <div className="flex flex-wrap items-center justify-start gap-1.5 text-start">
                          <button
                            type="button"
                            onClick={() => openDetails(prescription)}
                            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-start text-xs font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                          >
                            {t("View")}
                          </button>
                          {prescription.status === "Pending" && (
                            <>
                              <button
                                type="button"
                                onClick={() => openDetails(prescription, "process")}
                                className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-start text-xs font-medium text-emerald-700 hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                              >
                                {t("Process")}
                              </button>
                              <button
                                type="button"
                                onClick={() => openDetails(prescription, "reject")}
                                className="rounded-md border border-red-100 bg-red-50 px-2 py-1 text-start text-xs font-medium text-red-700 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                              >
                                {t("Reject")}
                              </button>
                            </>
                          )}
                        </div>
                      </TableActionsCell>
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
              summary={t("Showing page {{page}} of {{totalPages}} ({{count}} prescriptions)", { page: pageNumber, totalPages, count: totalCount })}
              rowsPerPageLabel={t("Rows per page")}
              previousLabel={t("Previous")}
              nextLabel={t("Next")}
              rtl={rtl}
              onGoToPage={(page) => goToPage(page, totalPages)}
              onPageSizeChange={handlePageSizeChange}
              getPageNumbers={getPageNumbers}
            />
          </div>
        )}
      </div>

    </LocalizedPage>
  );
}
