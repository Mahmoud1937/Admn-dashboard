import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faCheck,
  faPenToSquare,
  faPlus,
  faBuilding,
  faLocationDot,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";

import { useBranchesQuery } from "../hooks/useBranchesQuery";
import { useAllBranchesQuery } from "../hooks/useAllBranchesQuery";
import { useBranchMutations } from "../hooks/useBranchMutations";
import { useBranchToggleMutation } from "../hooks/useBranchToggleMutation";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";

import BranchFormModal from "./BranchFormModal";
import BranchesFilters from "./BranchesFilters";

import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import Pagination from "../../../shared/components/Pagination";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import StatusBadge from "../../providers/components/StatusBadge";

import { formatDate } from "../../../utils/formatDate";
import PermissionGuard from "../../auth/components/PermissionGuard";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import usePermission from "../../auth/hooks/usePermission";

function TableSkeleton({ rows = 6 }) {
  return (
    <div className="divide-y divide-slate-100" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="hidden h-3 w-32 animate-pulse rounded bg-slate-100 md:block" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function IconButton({ title, onClick, tone = "blue", children }) {
  const tones = {
    blue: "hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-blue-300",
    red: "hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-300",
    green:
      "hover:bg-emerald-50 hover:text-emerald-600 focus-visible:ring-emerald-300",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors focus:outline-none focus-visible:ring-2 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

export default function ProviderBranchesTab({ readOnly = false, renderFilterActions }) {
  const canUpdate = usePermission(PERMISSION_CODES.PROVIDER_BRANCHES_UPDATE);
  const { id: providerId } = useParams();

  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 400);

  const [governorateFilter, setGovernorateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchToToggle, setBranchToToggle] = useState(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination({
    resetKey: `${search}|${governorateFilter}|${cityFilter}|${statusFilter}`,
  });

  const providerQuery = useBranchesQuery({
    providerId,
    pageNumber,
    pageSize,
    search,
    governorateFilter,
    cityFilter,
    statusFilter,
  });
  const globalQuery = useAllBranchesQuery({
    governorateFilter,
    cityFilter,
    search,
    statusFilter,
    pageNumber,
    pageSize,
    enabled: readOnly,
  });
  const {
    branches,
    totalPages,
    totalCount,
    isLoading,
    isError,
    error,
    refetch,
  } = readOnly ? globalQuery : providerQuery;

  const { createMutation, updateMutation } = useBranchMutations({
    onCreateSuccess: () => setIsModalOpen(false),
    onUpdateSuccess: () => setIsModalOpen(false),
  });

  const { toggleMutation } = useBranchToggleMutation({
    onSuccess: () => setBranchToToggle(null),
  });

  const hasActiveFilters = !!(
    search ||
    governorateFilter ||
    cityFilter ||
    statusFilter
  );

  const handleOpenAdd = () => {
    setSelectedBranch(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch) => {
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };

  const handleConfirmToggle = () => {
    if (branchToToggle) {
      toggleMutation.mutate(branchToToggle);
    }
  };

  const showActions = !readOnly && canUpdate;

  return (
    <div className="min-w-0 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Branches</h2>
          <p className="text-sm text-slate-500">
            {isLoading || isError
              ? "Manage locations and contact details."
              : `${totalCount ?? branches.length} ${
                  (totalCount ?? branches.length) === 1 ? "branch" : "branches"
                }${hasActiveFilters ? " match your filters" : " in total"}`}
          </p>
        </div>

        {!readOnly && (
          <PermissionGuard permission={PERMISSION_CODES.PROVIDER_BRANCHES_CREATE}>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add branch
            </button>
          </PermissionGuard>
        )}
      </div>

      {/* Filters + Table */}
      <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100">
          <BranchesFilters
            search={searchInput}
            onSearchChange={setSearchInput}
            governorateFilter={governorateFilter}
            onGovernorateFilterChange={(value) => {
              setGovernorateFilter(value);
              setCityFilter("");
            }}
            cityFilter={cityFilter}
            onCityFilterChange={setCityFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          >
            {renderFilterActions?.({
              governorateId: governorateFilter || undefined,
              cityId: cityFilter || undefined,
              search,
              status: statusFilter === "" ? 0 : Number(statusFilter),
            })}
          </BranchesFilters>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <QueryErrorState
            title="Unable to load branches"
            error={error}
            onRetry={refetch}
          />
        ) : branches.length === 0 ? (
          <TableEmptyState
            icon={faBuilding}
            title="No branches found"
            hasActiveFilters={hasActiveFilters}
            emptyMessage="No branches have been added for this provider yet."
          />
        ) : (
          <>
            <ScrollableTable className="scroll-table">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-100 text-xs font-medium text-slate-500">
                    <th className="px-6 py-3">Branch</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Coordinates</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    {showActions && (
                      <th className="px-6 py-3 text-center">Actions</th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {branches.map((branch) => {
                    const hasCoords =
                      branch.latitude != null && branch.longitude != null;

                    return (
                      <tr
                        key={branch.id}
                        className="transition-colors hover:bg-slate-50"
                      >
                        {/* Branch */}
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
                              <FontAwesomeIcon icon={faBuilding} />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">
                                {branch.branchName}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {branch.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-slate-800">
                            {[branch.cityName, branch.governorateName]
                              .filter(Boolean)
                              .join(", ") || "-"}
                          </p>
                          <p
                            className="max-w-[280px] truncate text-xs text-slate-500"
                            title={branch.fullAddress}
                          >
                            {branch.fullAddress || "No address"}
                          </p>
                          {branch.kilo != null && (
                            <p className="text-xs text-slate-500">
                              Road kilometer marker: {branch.kilo}
                            </p>
                          )}
                        </td>

                        {/* Coordinates + map link */}
                        <td className="px-4 py-3.5">
                          {hasCoords || branch.mapUrl ? (
                            <div className="flex flex-col items-start gap-1">
                              {hasCoords && (
                                <span className="text-xs tabular-nums text-slate-600">
                                  {branch.latitude}, {branch.longitude}
                                </span>
                              )}
                              {branch.mapUrl && (
                                <a
                                  href={branch.mapUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-900 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FontAwesomeIcon
                                    icon={faLocationDot}
                                    className="text-[11px]"
                                  />
                                  Open in maps
                                  <FontAwesomeIcon
                                    icon={faArrowUpRightFromSquare}
                                    className="text-[9px]"
                                  />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 text-center">
                          <StatusBadge isActive={branch.isActive} />
                        </td>

                        {/* Joined */}
                        <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                          {formatDate(branch.createdAt)}
                        </td>

                        {/* Actions */}
                        {showActions && (
                          <td
                            className="px-6 py-3.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <IconButton
                                title="Edit branch"
                                onClick={() => handleOpenEdit(branch)}
                              >
                                <FontAwesomeIcon icon={faPenToSquare} />
                              </IconButton>

                              {branch.isActive ? (
                                <IconButton
                                  title="Deactivate branch"
                                  tone="red"
                                  onClick={() => setBranchToToggle(branch)}
                                >
                                  <FontAwesomeIcon icon={faBan} />
                                </IconButton>
                              ) : (
                                <IconButton
                                  title="Activate branch"
                                  tone="green"
                                  onClick={() => setBranchToToggle(branch)}
                                >
                                  <FontAwesomeIcon icon={faCheck} />
                                </IconButton>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ScrollableTable>

            <div className="border-t border-slate-100">
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel="branches"
                getPageNumbers={getPageNumbers}
                onGoToPage={(page) => goToPage(page, totalPages)}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          </>
        )}
      </div>

      {/* Branch Modal */}
      {!readOnly && (
        <BranchFormModal
          isOpen={isModalOpen}
          branch={selectedBranch}
          providerId={providerId}
          createMutation={createMutation}
          updateMutation={updateMutation}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Activate / Deactivate Confirmation */}
      {showActions && (
        <ConfirmDeleteModal
          isOpen={!!branchToToggle}
          variant={branchToToggle?.isActive ? "danger" : "success"}
          title={
            branchToToggle?.isActive ? "Deactivate branch" : "Activate branch"
          }
          message={
            branchToToggle?.isActive
              ? `Are you sure you want to deactivate "${branchToToggle?.branchName}"? You can reactivate it later.`
              : `Are you sure you want to activate "${branchToToggle?.branchName}"?`
          }
          confirmLabel={branchToToggle?.isActive ? "Deactivate" : "Activate"}
          onConfirm={handleConfirmToggle}
          onCancel={() => setBranchToToggle(null)}
          isLoading={toggleMutation.isPending}
        />
      )}
    </div>
  );
}
