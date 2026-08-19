import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faCheck, faPenToSquare, faPlus, faSearch, faBuilding } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import { useBranchesQuery } from "../hooks/useBranchesQuery";
import { useBranchMutations } from "../hooks/useBranchMutations";
import { useBranchToggleMutation } from "../hooks/useBranchToggleMutation";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import BranchFormModal from "./BranchFormModal";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import Pagination from "../../../shared/components/Pagination";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import StatusBadge from "../../providers/components/StatusBadge";
import { formatDate } from "../../../utils/formatDate";
import { useGovernoratesLookup } from "../../cities/hooks/useGovernoratesLookup";
import GovernorateSelect from "../../cities/components/GovernorateSelect";

export default function ProviderBranchesTab() {
  const { id: providerId } = useParams();

  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 400);

  const [governorateFilter, setGovernorateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchToToggle, setBranchToToggle] = useState(null);

  const { governorates } = useGovernoratesLookup();

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    lockPageSize,
    getPageNumbers,
  } = useServerPagination({
    resetKey: `${search}|${governorateFilter}|${cityFilter}|${statusFilter}`,
  });

  const {
    branches,
    totalPages,
    totalCount,
    serverPageSize,
    isLoading,
    isError,
    error,
  } = useBranchesQuery({
    providerId,
    pageNumber,
    pageSize,
    search,
    governorateFilter,
    cityFilter,
    statusFilter,
  });

  useEffect(() => {
    lockPageSize(serverPageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverPageSize]);

  const { createMutation, updateMutation } = useBranchMutations({
    onCreateSuccess: () => setIsModalOpen(false),
    onUpdateSuccess: () => setIsModalOpen(false),
  });

  const { toggleMutation } = useBranchToggleMutation({
    onSuccess: () => setBranchToToggle(null),
  });

  const hasActiveFilters = !!(search || governorateFilter || cityFilter || statusFilter);

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

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 ">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search branches..."
              className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
            />
          </div>

        <GovernorateSelect
  value={governorateFilter}
  onChange={(value) => {
    setGovernorateFilter(value);
    setCityFilter("");
  }}
  placeholder="All governorates"
/>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          >
            <option value="">All statuses</option>
            <option value="1">Active</option>
            <option value="2">Inactive</option>
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Branch
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-slate-400">Loading branches...</p>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-red-500">
            {error?.message || "Failed to load branches."}
          </p>
        ) : branches.length === 0 ? (
          <TableEmptyState
            icon={faBuilding}
            title="No branches found"
            hasActiveFilters={hasActiveFilters}
            emptyMessage="No branches have been added for this provider yet."
          />
        ) : (
          <>
            <div className="p-6 overflow-x-auto scroll-table">
              <table className="w-full min-w-[1400px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-2.5 text-center">Branch Name</th>
                    <th className="px-6 py-2.5 text-center">Government</th>
                    <th className="px-6 py-2.5 text-center">City</th>
                    <th className="px-6 py-2.5 text-center">Email</th>

                    <th className="px-6 py-2.5 text-center">Full Address</th>
                    <th className="px-6 py-2.5 text-center">Map URL</th>
                    <th className="px-6 py-2.5 text-center">Latitude</th>
                    <th className="px-6 py-2.5 text-center">Longitude</th>
                    <th className="px-6 py-2.5 text-center">Status</th>
                    <th className="px-6 py-2.5 text-center">Join Date</th>
                    <th className="px-6 py-2.5 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {branches.map((branch) => (
                    <tr
                      key={branch.id}
                      className="border-b border-slate-100 last:border-0 transition-all hover:bg-primary-600/10 hover:text-primary-600"
                    >
                      <td className="px-4 py-2 text-center font-semibold text-slate-900">
                        {branch.branchName}
                      </td>
                      <td className="px-6 py-2 text-center text-slate-600">{branch.governorateName}</td>
                      <td className="px-6 py-2 text-center text-slate-600">{branch.cityName}</td>
                      <td className="px-6 py-2 text-center text-slate-600">{branch.email}</td>

                      <td className="px-6 py-2 text-center text-slate-600">{branch.fullAddress}</td>

                      <td className="px-6 py-2 text-center">
                        {branch.mapUrl ? (
                          <a
                            href={branch.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-6 py-2 text-center text-slate-600">
                        {branch.latitude ?? "-"}
                      </td>

                      <td className="px-6 py-2 text-center text-slate-600">
                        {branch.longitude ?? "-"}
                      </td>

                      <td className="px-6 py-2 text-center">
                        <StatusBadge isActive={branch.isActive} />
                      </td>

                      <td className="px-6 py-2 text-center text-slate-600">
                        {formatDate(branch.createdAt)}
                      </td>

                      <td className="px-6 py-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(branch)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </button>

                          {branch.isActive ? (
                            <button
                              onClick={() => setBranchToToggle(branch)}
                              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                              title="Deactivate"
                            >
                              <FontAwesomeIcon icon={faBan} />
                            </button>
                          ) : (
                            <button
                              onClick={() => setBranchToToggle(branch)}
                              className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                              title="Activate"
                            >
                              <FontAwesomeIcon icon={faCheck} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
          </>
        )}
      </div>

      <BranchFormModal
        isOpen={isModalOpen}
        branch={selectedBranch}
        providerId={providerId}
        governorates={governorates ?? []}
        createMutation={createMutation}
        updateMutation={updateMutation}
        onClose={() => setIsModalOpen(false)}
      />

      <ConfirmDeleteModal
        isOpen={!!branchToToggle}
        variant={branchToToggle?.isActive ? "danger" : "success"}
        title={branchToToggle?.isActive ? "Deactivate Branch" : "Activate Branch"}
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
    </div>
  );
}