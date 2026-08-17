import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faCheck, faPenToSquare, faPlus, faSearch, faTag } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { useProviderServicesQuery } from "../hooks/useProviderServicesQuery";
import { useProviderServiceMutations } from "../hooks/useProviderServiceMutations";
import { useProviderServiceToggleMutation } from "../hooks/useProviderServiceToggleMutation";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import StatusBadge from "../../services-admin/components/StatusBadge";
import { formatDate } from "../../../utils/formatDate";
import Pagination from "../../../shared/components/Pagination";
import ProviderServiceFormModal from "./ProviderServiceFormModal";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";


export default function ProviderServicesTab() {
  const { id: providerId } = useParams();

  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 400);

  const [statusFilter, setStatusFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceToToggle, setServiceToToggle] = useState(null);

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    lockPageSize,
    getPageNumbers,
  } = useServerPagination({
    resetKey: `${search}|${statusFilter}`,
  });

  const {
    providerServices,
    totalPages,
    totalCount,
    serverPageSize,
    isLoading,
    isError,
    error,
  } = useProviderServicesQuery({
    providerId,
    pageNumber,
    pageSize,
    search,
    statusFilter,
  });

  useEffect(() => {
    lockPageSize(serverPageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverPageSize]);

const { createMutation, updateMutation, isSaving, serverErrors, clearServerErrors } =
  useProviderServiceMutations({
    onCreateSuccess: () => setIsModalOpen(false),
    onUpdateSuccess: () => setIsModalOpen(false),
  });

  const { toggleMutation } = useProviderServiceToggleMutation({
    onSuccess: () => setServiceToToggle(null),
  });

  const hasActiveFilters = !!(search || statusFilter);

  const handleOpenAdd = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleSave = (payload) => {
    if (selectedService) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleConfirmToggle = () => {
    if (serviceToToggle) {
      toggleMutation.mutate(serviceToToggle);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search services..."
              className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
            />
          </div>

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
          Add Service
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-slate-400">Loading services...</p>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-red-500">
            {error?.message || "Failed to load services."}
          </p>
        ) : providerServices.length === 0 ? (
          <TableEmptyState
            icon={faTag}
            title="No services found"
            hasActiveFilters={hasActiveFilters}
            emptyMessage="No services have been added for this provider yet."
          />
        ) : (
          <>
            <div className="p-6 overflow-x-auto scroll-table">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-2.5 text-center">Service</th>
                    <th className="px-6 py-2.5 text-center">Price Before</th>
                    <th className="px-6 py-2.5 text-center">Discount</th>
                    <th className="px-6 py-2.5 text-center">Price After</th>
                    <th className="px-6 py-2.5 text-center">Special Offer</th>
                    <th className="px-6 py-2.5 text-center">Status</th>
                    <th className="px-6 py-2.5 text-center">Join Date</th>
                    <th className="px-6 py-2.5 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {providerServices.map((service) => (
                    <tr
                      key={service.id}
                      className="border-b border-slate-100 last:border-0 transition-all hover:bg-primary-600/10 hover:text-primary-600"
                    >
                      <td className="px-4 py-2 text-center">
                        <p className="font-semibold text-slate-900">{service.serviceNameEn}</p>
                        <p className="text-xs text-slate-400">{service.serviceNameAr}</p>
                      </td>

                      <td className="px-6 py-2 text-center text-slate-600">
                        {Number(service.priceBefore).toFixed(2)}
                      </td>

                      <td className="px-6 py-2 text-center text-slate-600">
                        {service.discountPercentage
                          ? `${Number(service.discountPercentage)}%`
                          : "-"}
                      </td>

                      <td className="px-6 py-2 text-center font-medium text-slate-900">
                        {Number(service.priceAfter).toFixed(2)}
                      </td>

                      <td className="px-6 py-2 text-center">
                        {service.isSpecialOffer ? (
                          <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                            Special
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-6 py-2 text-center">
                        <StatusBadge isActive={service.isActive} />
                      </td>

                      <td className="px-6 py-2 text-center text-slate-600">
                        {formatDate(service.createdAt)}
                      </td>

                      <td className="px-6 py-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(service)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </button>

                          {service.isActive ? (
                            <button
                              onClick={() => setServiceToToggle(service)}
                              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                              title="Deactivate"
                            >
                              <FontAwesomeIcon icon={faBan} />
                            </button>
                          ) : (
                            <button
                              onClick={() => setServiceToToggle(service)}
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
              itemLabel="services"
              getPageNumbers={getPageNumbers}
              onGoToPage={(page) => goToPage(page, totalPages)}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </div>

<ProviderServiceFormModal
  isOpen={isModalOpen}
  providerService={selectedService}
  providerId={providerId}
  onSave={handleSave}
  onClose={() => setIsModalOpen(false)}
  isSaving={isSaving}
  serverErrors={serverErrors}
  onClearErrors={clearServerErrors}
/>

      <ConfirmDeleteModal
        isOpen={!!serviceToToggle}
        variant={serviceToToggle?.isActive ? "danger" : "success"}
        title={serviceToToggle?.isActive ? "Deactivate Service" : "Activate Service"}
        message={
          serviceToToggle?.isActive
            ? `Are you sure you want to deactivate "${serviceToToggle?.serviceNameEn}"? You can reactivate it later.`
            : `Are you sure you want to activate "${serviceToToggle?.serviceNameEn}"?`
        }
        confirmLabel={serviceToToggle?.isActive ? "Deactivate" : "Activate"}
        onConfirm={handleConfirmToggle}
        onCancel={() => setServiceToToggle(null)}
        isLoading={toggleMutation.isPending}
      />
    </div>
  );
}