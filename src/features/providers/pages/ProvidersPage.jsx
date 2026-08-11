import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { useProviderToggleMutation } from "../hooks/Useprovidertogglemutation";
import { useProvidersQuery } from "../hooks/useProvidersQuery";
import ProvidersTable from "../components/ProvidersTable";
import Pagination from "../../../shared/components/Pagination";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import ProvidersHeader from "../components/ProvidersHeader";
import ProvidersSearchBar from "../components/ProvidersSearchBar";
import { countActiveFilters } from "../utils/countActiveFilters";
import ProvidersFilters, { emptyFilters } from "../components/ProvidersFilters";



export default function ProvidersPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [providerToToggle, setProviderToToggle] = useState(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);

  const filterPanelRef = useRef(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    lockPageSize,
    getPageNumbers,
  } = useServerPagination({
    resetKey: `${search}-${JSON.stringify(filters)}`,
  });

  useEffect(() => {
    if (!isFilterOpen) return;

    const handleClickOutside = (e) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  const {
    providers,
    totalCount,
    totalPages,
    serverPageSize,
    isLoading,
    isError,
    error,
    isPlaceholderData,
  } = useProvidersQuery({ pageNumber, pageSize, search, filters });

  lockPageSize(serverPageSize);

  const { toggleMutation } = useProviderToggleMutation({
    onSuccess: () => setProviderToToggle(null),
  });

  const openFilters = () => {
    setDraftFilters(filters);
    setIsFilterOpen(true);
  };

  const applyFilters = () => {
    setFilters(draftFilters);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setDraftFilters(emptyFilters);
  };

const handleEdit = (provider) => {
  navigate(`/providers/${provider.id}?mode=edit`);
};

  const handleToggleClick = (provider) => {
    setProviderToToggle(provider);
  };

  const confirmToggle = () => {
    if (providerToToggle) {
      toggleMutation.mutate(providerToToggle);
    }
  };

  const isDeactivating = providerToToggle?.isActive;

  return (
    <div>
      <ProvidersHeader />

      <div className="mt-6 rounded-xl border border-slate-200 bg-white">
        <div className="relative">
          <ProvidersSearchBar
            value={search}
            onChange={setSearch}
            onFilterClick={openFilters}
            activeFilterCount={countActiveFilters(filters)}
          />

          {isFilterOpen && (
            <ProvidersFilters
              draft={draftFilters}
              onChange={setDraftFilters}
              onApply={applyFilters}
              onClear={clearFilters}
              onClose={() => setIsFilterOpen(false)}
              panelRef={filterPanelRef}
            />
          )}
        </div>

        {isLoading && (
          <p className="p-6 text-center text-sm text-slate-400">Loading providers...</p>
        )}

        {isError && (
          <p className="p-6 text-center text-sm text-red-500">
            {error?.message || "Failed to load providers."}
          </p>
        )}

        {!isLoading && !isError && (
          <div
            className={`overflow-hidden rounded-b-xl transition-opacity ${isPlaceholderData ? "opacity-60" : "opacity-100"
              }`}
          >
            <div className="max-h-[600px] overflow-y-auto">
              <ProvidersTable
                providers={providers}
                onEdit={handleEdit}
                onToggleStatus={handleToggleClick}
              />
            </div>

            {providers.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">No providers found.</p>
            )}

            {providers.length > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel="providers"
                onGoToPage={(page) => goToPage(page, totalPages)}
                onPageSizeChange={handlePageSizeChange}
                getPageNumbers={getPageNumbers}
              />
            )}
          </div>
        )}

        <ConfirmDeleteModal
          isOpen={!!providerToToggle}
          title={isDeactivating ? "Deactivate Provider" : "Activate Provider"}
          message={
            isDeactivating
              ? `Are you sure you want to deactivate "${providerToToggle?.enName}"? You can reactivate it later.`
              : `Are you sure you want to activate "${providerToToggle?.enName}"?`
          }
          confirmLabel={isDeactivating ? "Deactivate" : "Activate"}
          variant={isDeactivating ? "danger" : "success"}
          isLoading={toggleMutation.isPending}
          onConfirm={confirmToggle}
          onCancel={() => setProviderToToggle(null)}
        />

        {toggleMutation.isError && (
          <p className="mt-3 px-6 text-sm text-red-500">
            {toggleMutation.error?.response?.data?.message ||
              "Failed to update provider status. Please try again."}
          </p>
        )}
      </div>
    </div>
  );
}