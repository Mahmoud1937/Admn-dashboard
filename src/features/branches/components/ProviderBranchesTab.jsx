import TableActionsCell from "../../../shared/components/TableActionsCell";
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
import useFilterPanel from "../../../shared/hooks/useFilterPanel";

import BranchFormModal from "./BranchFormModal";
import BranchesFilters from "./BranchesFilters";
import SearchBarWithFilters from "../../../shared/components/SearchBarWithFilters";

import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import Pagination from "../../../shared/components/Pagination";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import QueryErrorState from "../../../localization/ProviderDetailsQueryErrorState";
import StatusBadge from "../../providers/components/StatusBadge";

import { formatDate } from "../../../utils/formatDate";
import PermissionGuard from "../../auth/components/PermissionGuard";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import usePermission from "../../auth/hooks/usePermission";
import Skeleton, { SkeletonTable } from "../../../shared/components/Skeleton";
import useProviderDetailsText from "../../../localization/useProviderDetailsText";
import useLanguage from "../../../localization/useLanguage";

const EMPTY_FILTERS = { governorateId: "", cityId: "", status: "" };

function TableSkeleton({ rows = 6 }) {
  return (
    <SkeletonTable
      rows={rows}
      rowClassName="flex items-center gap-4 px-6 py-4"
    >
      <Skeleton className="h-10 w-10 shrink-0 rounded-xl bg-slate-100" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-40 rounded bg-slate-100" />
        <Skeleton className="h-3 w-56 rounded bg-slate-100" />
      </div>
      <Skeleton className="hidden h-3 w-32 rounded bg-slate-100 md:block" />
      <Skeleton className="h-6 w-16 rounded-full bg-slate-100" />
    </SkeletonTable>
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

export default function ProviderBranchesTab({ readOnly = false, renderFilterActions, localized = false }) {
  const tr = useProviderDetailsText(localized);
  const { direction, language } = useLanguage();
  const rtl = localized && direction === "rtl";
  const canUpdate = usePermission(PERMISSION_CODES.PROVIDER_BRANCHES_UPDATE);
  const { id: providerId } = useParams();

  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 400);

  const {
    isOpen: isFilterOpen,
    filters,
    draft,
    setDraft,
    panelRef,
    triggerRef,
    toggle: toggleFilters,
    close: closeFilters,
    apply: applyFilters,
    clear: clearFilters,
  } = useFilterPanel({ emptyFilters: EMPTY_FILTERS });
  const governorateFilter = filters.governorateId;
  const cityFilter = filters.cityId;
  const statusFilter = filters.status;

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
    language: localized ? language : undefined,
  });
  const globalQuery = useAllBranchesQuery({
    governorateFilter,
    cityFilter,
    search,
    statusFilter,
    pageNumber,
    pageSize,
    enabled: readOnly,
    language: localized ? language : undefined,
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
  const branchCount = totalCount ?? branches.length;

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
          <h2 className="text-lg font-semibold text-slate-900">{tr("Branches")}</h2>
          <p className="text-sm text-slate-500">
            {isLoading || isError
              ? tr(readOnly ? "Browse branch locations and contact details." : "Manage locations and contact details.")
              : localized
                ? tr(hasActiveFilters
                  ? branchCount === 1 ? "{{count}} branch matches your filters" : "{{count}} branches match your filters"
                  : branchCount === 1 ? "{{count}} branch in total" : "{{count}} branches in total", { count: branchCount })
                : `${branchCount} ${
                    branchCount === 1 ? "branch" : "branches"
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
              {tr("Add branch")}
            </button>
          </PermissionGuard>
        )}
      </div>

      {/* Filters + Table */}
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative">
          <SearchBarWithFilters
            value={searchInput}
            onChange={setSearchInput}
            placeholder={tr("Search by branch name (EN/AR) or email...")}
            filterLabel={tr("Filters")}
            rtl={rtl}
            onFilterClick={toggleFilters}
            filterButtonRef={triggerRef}
            activeFilterCount={Number(Boolean(governorateFilter)) + Number(Boolean(cityFilter)) + Number(Boolean(statusFilter))}
          >
            {renderFilterActions?.({
              governorateId: governorateFilter || undefined,
              cityId: cityFilter || undefined,
              search,
              status: statusFilter === "" ? 0 : Number(statusFilter),
            })}
          </SearchBarWithFilters>
          {isFilterOpen && (
            <BranchesFilters
              draft={draft}
              onChange={setDraft}
              onApply={applyFilters}
              onClear={clearFilters}
              onClose={closeFilters}
              panelRef={panelRef}
              localized={localized}
            />
          )}
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <QueryErrorState
            localized={localized}
            title={tr("Unable to load branches")}
            error={error}
            onRetry={refetch}
          />
        ) : branches.length === 0 ? (
          <TableEmptyState
            icon={faBuilding}
            title={tr("No branches found")}
            hasActiveFilters={hasActiveFilters}
            emptyMessage={tr(readOnly ? "No branches are available yet." : "No branches have been added for this provider yet.")}
            filterMessage={tr("Try a different search term.")}
          />
        ) : (
          <>
            <ScrollableTable className="scroll-table">
              <table className="w-full min-w-[960px] text-start text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-100 text-xs font-medium text-slate-500">
                    <th className="px-6 py-3">{tr("Branch")}</th>
                    <th className="px-4 py-3">{tr("Location")}</th>
                    <th className="px-4 py-3">{tr("Coordinates")}</th>
                    <th className="px-4 py-3 text-center">{tr("Status")}</th>
                    <th className="px-4 py-3">{tr("Joined")}</th>
                    {showActions && (
                      <TableActionsCell as="th" side={rtl ? "left" : "right"} className="px-6 py-3 text-center">{tr("Actions")}</TableActionsCell>
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
                                {branch.email || tr("No email")}
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
                            {branch.fullAddress || tr("No address")}
                          </p>
                          {branch.kilo != null && (
                            <p className="text-xs text-slate-500">
                              {tr("Road kilometer marker:")} <bdi dir="ltr">{branch.kilo}</bdi>
                            </p>
                          )}
                        </td>

                        {/* Coordinates + map link */}
                        <td className="px-4 py-3.5">
                          {hasCoords || branch.mapUrl ? (
                            <div className="flex flex-col items-start gap-1">
                              {hasCoords && (
                                <span className="text-xs tabular-nums text-slate-600">
                                  <bdi dir="ltr">{branch.latitude}, {branch.longitude}</bdi>
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
                                  {tr("Open in maps")}
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
                          <StatusBadge isActive={branch.isActive} activeLabel={localized ? tr("Active") : undefined} inactiveLabel={localized ? tr("Inactive") : undefined} />
                        </td>

                        {/* Joined */}
                        <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                          <bdi dir="ltr">{formatDate(branch.createdAt)}</bdi>
                        </td>

                        {/* Actions */}
                        {showActions && (
                          <TableActionsCell hoverColor="var(--color-slate-50)" side={rtl ? "left" : "right"}
                            className="px-6 py-3.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <IconButton
                                title={tr("Edit branch")}
                                onClick={() => handleOpenEdit(branch)}
                              >
                                <FontAwesomeIcon icon={faPenToSquare} />
                              </IconButton>

                              {branch.isActive ? (
                                <IconButton
                                  title={tr("Deactivate branch")}
                                  tone="red"
                                  onClick={() => setBranchToToggle(branch)}
                                >
                                  <FontAwesomeIcon icon={faBan} />
                                </IconButton>
                              ) : (
                                <IconButton
                                  title={tr("Activate branch")}
                                  tone="green"
                                  onClick={() => setBranchToToggle(branch)}
                                >
                                  <FontAwesomeIcon icon={faCheck} />
                                </IconButton>
                              )}
                            </div>
                          </TableActionsCell>
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
                itemLabel={tr("branches")}
                summary={localized ? tr("Showing page {{page}} of {{totalPages}} ({{count}} branches)", { page: pageNumber, totalPages, count: totalCount }) : undefined}
                rowsPerPageLabel={tr("Rows per page")}
                previousLabel={tr("Previous")}
                nextLabel={tr("Next")}
                rtl={rtl}
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
          localized={localized}
        />
      )}

      {/* Activate / Deactivate Confirmation */}
      {showActions && (
        <ConfirmDeleteModal
          isOpen={!!branchToToggle}
          variant={branchToToggle?.isActive ? "danger" : "success"}
          title={
            tr(branchToToggle?.isActive ? "Deactivate branch" : "Activate branch")
          }
          message={
            branchToToggle?.isActive
              ? localized
                ? tr("Are you sure you want to deactivate \"{{name}}\"? You can reactivate it later.", { name: branchToToggle?.branchName })
                : `Are you sure you want to deactivate "${branchToToggle?.branchName}"? You can reactivate it later.`
              : localized
                ? tr("Are you sure you want to activate \"{{name}}\"?", { name: branchToToggle?.branchName })
                : `Are you sure you want to activate "${branchToToggle?.branchName}"?`
          }
          confirmLabel={tr(branchToToggle?.isActive ? "Deactivate" : "Activate")}
          cancelLabel={tr("Cancel")}
          loadingLabel={tr("Processing...")}
          onConfirm={handleConfirmToggle}
          onCancel={() => setBranchToToggle(null)}
          isLoading={toggleMutation.isPending}
        />
      )}
    </div>
  );
}
