import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { createGovernorate, deleteGovernorate, getGovernorates, updateGovernorate } from "../services/governoratesService";
import GovernorateFormModal from "../components/GovernorateFormModel";
import GovernoratesTable from "../components/GovernoratesTable";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import Pagination from "../../../shared/components/Pagination";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";

export default function GovernoratesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGovernorate, setEditingGovernorate] = useState(null);
  const [governorateToDelete, setGovernorateToDelete] = useState(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    lockPageSize,
    getPageNumbers,
  } = useServerPagination({ resetKey: search });

  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ["governorates", pageNumber, pageSize, search],
    queryFn: () => getGovernorates(pageNumber, pageSize, search),
    placeholderData: (previousData) => previousData,
  });

  const governorates = data?.data?.items ?? [];
  const totalCount = data?.data?.totalCount ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  lockPageSize(data?.data?.pageSize);

  const createMutation = useMutation({
    mutationFn: createGovernorate,
    onSuccess: () => {
      toast.success("Governorate created successfully.");
      queryClient.invalidateQueries({ queryKey: ["governorates"] });
      setIsFormOpen(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to create governorate.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateGovernorate,
    onSuccess: () => {
      toast.success("Governorate updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["governorates"] });
      setIsFormOpen(false);
      setEditingGovernorate(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update governorate.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGovernorate,
    onSuccess: () => {
      toast.success("Governorate deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["governorates"] });
      setGovernorateToDelete(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete governorate.");
    },
  });

  const openAddForm = () => {
    setEditingGovernorate(null);
    setIsFormOpen(true);
  };

  const openEditForm = (governorate) => {
    setEditingGovernorate(governorate);
    setIsFormOpen(true);
  };

  const handleSave = (payload) => {
    if (payload.id) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const confirmDelete = () => {
    if (governorateToDelete) {
      deleteMutation.mutate(governorateToDelete.id);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const hasActiveFilters = !!search;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Governorates Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage all governorates across the platform.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Governorate
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search governorates by name (EN/AR)..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
            />
          </div>
        </div>

        {isLoading && (
          <p className="p-8 text-center text-sm text-slate-400">
            Loading governorates...
          </p>
        )}

        {isError && (
          <p className="p-8 text-center text-sm text-red-500">
            {error?.message || "Failed to load governorates."}
          </p>
        )}

        {!isLoading && !isError && (
          <div className={`transition-opacity ${isPlaceholderData ? "opacity-60" : "opacity-100"}`}>
            <GovernoratesTable
              governorates={governorates}
              hasActiveFilters={hasActiveFilters}
              onEdit={openEditForm}
              onDeleteRequest={setGovernorateToDelete}
            />

            {governorates.length > 0 && (
              <Pagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemLabel="governorates"
                onGoToPage={(page) => goToPage(page, totalPages)}
                onPageSizeChange={handlePageSizeChange}
                getPageNumbers={getPageNumbers}
              />
            )}
          </div>
        )}
      </div>

      <GovernorateFormModal
        isOpen={isFormOpen}
        governorate={editingGovernorate}
        onSave={handleSave}
        onClose={() => {
          setIsFormOpen(false);
          setEditingGovernorate(null);
        }}
        isSaving={isSaving}
      />

      <ConfirmDeleteModal
        isOpen={!!governorateToDelete}
        title="Delete Governorate"
        message={`Are you sure you want to delete "${governorateToDelete?.enName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setGovernorateToDelete(null)}
      />
    </div>
  );
}