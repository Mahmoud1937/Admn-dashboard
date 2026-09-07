import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faCheck,
  faPenToSquare,
  faPlus,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";

import { useBranchesQuery } from "../hooks/useBranchesQuery";
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
import StatusBadge from "../../providers/components/StatusBadge";

import { formatDate } from "../../../utils/formatDate";
import QueryErrorState from "../../../shared/components/QueryErrorState";


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



  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination({
    resetKey: `${search}|${governorateFilter}|${cityFilter}|${statusFilter}`,
  });

  const {
    branches,
    totalPages,
    totalCount,
    isLoading,
    isError,
    error,
    refetch
  } = useBranchesQuery({
    providerId,
    pageNumber,
    pageSize,
    search,
    governorateFilter,
    cityFilter,
    statusFilter,
  });

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Branches</h2>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Branch
        </button>
      </div>

      {/* Card: Filters + Table */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
        {/* Filters */}
        <BranchesFilters
          search={searchInput}
          onSearchChange={setSearchInput}
          governorateFilter={governorateFilter}
          onGovernorateFilterChange={(value) => {
            setGovernorateFilter(value);
            setCityFilter("");
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Table Content */}
        {isLoading ? (
          <p className="py-8 text-center text-sm text-slate-400">
            Loading branches...
          </p>
        ) : 
        
isError ? (
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
            <ScrollableTable className="p-6 scroll-table">
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

                      <td className="px-6 py-2 text-center text-slate-600">
                        {branch.governorateName}
                      </td>

                      <td className="px-6 py-2 text-center text-slate-600">
                        {branch.cityName}
                      </td>

                      <td className="px-6 py-2 text-center text-slate-600">
                        {branch.email}
                      </td>

                      <td className="px-6 py-2 text-center text-slate-600">
                        {branch.fullAddress}
                      </td>

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

                      <td
                        className="px-6 py-2"
                        onClick={(e) => e.stopPropagation()}
                      >
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
            </ScrollableTable>

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

      {/* Branch Modal */}
      <BranchFormModal
        isOpen={isModalOpen}
        branch={selectedBranch}
        providerId={providerId}
 
        createMutation={createMutation}
        updateMutation={updateMutation}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Activate / Deactivate Confirmation */}
      <ConfirmDeleteModal
        isOpen={!!branchToToggle}
        variant={branchToToggle?.isActive ? "danger" : "success"}
        title={
          branchToToggle?.isActive
            ? "Deactivate Branch"
            : "Activate Branch"
        }
        message={
          branchToToggle?.isActive
            ? `Are you sure you want to deactivate "${branchToToggle?.branchName}"? You can reactivate it later.`
            : `Are you sure you want to activate "${branchToToggle?.branchName}"?`
        }
        confirmLabel={
          branchToToggle?.isActive ? "Deactivate" : "Activate"
        }
        onConfirm={handleConfirmToggle}
        onCancel={() => setBranchToToggle(null)}
        isLoading={toggleMutation.isPending}
      />
    </div>
  );
}
