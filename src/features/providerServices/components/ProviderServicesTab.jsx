import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faCheck,
  faPenToSquare,
  faPlus,
  faSearch,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import { useProviderServicesQuery } from "../hooks/useProviderServicesQuery";
import { useProviderServiceMutations } from "../hooks/useProviderServiceMutations";
import { useProviderServiceToggleMutation } from "../hooks/useProviderServiceToggleMutation";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import ScrollableTable from "../../../shared/components/ScrollableTable";
import StatusBadge from "../../services-admin/components/StatusBadge";
import { formatDate } from "../../../utils/formatDate";
import Pagination from "../../../shared/components/Pagination";
import ProviderServiceFormModal from "./ProviderServiceFormModal";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import PermissionGuard from "../../auth/components/PermissionGuard";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import usePermission from "../../auth/hooks/usePermission";

function TableSkeleton({ rows = 6 }) {
  return (
    <div className="divide-y divide-slate-100" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 px-6 py-4">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-44 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="hidden h-3 w-16 animate-pulse rounded bg-slate-100 md:block" />
          <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
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

export default function ProviderServicesTab() {
  const canUpdate = usePermission(PERMISSION_CODES.PROVIDER_SERVICES_UPDATE);
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
    getPageNumbers,
  } = useServerPagination({
    resetKey: `${search}|${statusFilter}`,
  });

  const {
    providerServices,
    totalPages,
    totalCount,
    isLoading,
    isError,
    error,
    refetch,
  } = useProviderServicesQuery({
    providerId,
    pageNumber,
    pageSize,
    search,
    statusFilter,
  });

  const {
    createMutation,
    updateMutation,
    isSaving,
    serverErrors,
    clearServerErrors,
  } = useProviderServiceMutations({
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

  const count = totalCount ?? providerServices?.length ?? 0;

  return (
    <div className="min-w-0 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Services</h2>
          <p className="text-sm text-slate-500">
            {isLoading || isError
              ? "Manage prices, discounts and offers."
              : `${count} ${count === 1 ? "service" : "services"}${
                  hasActiveFilters ? " match your filters" : " in total"
                }`}
          </p>
        </div>

        <PermissionGuard permission={PERMISSION_CODES.PROVIDER_SERVICES_CREATE}>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add service
          </button>
        </PermissionGuard>
      </div>

      {/* Filters + Table */}
      <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative min-w-[240px] flex-1">
            <FontAwesomeIcon
              icon={faSearch}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search services"
              aria-label="Search services"
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All statuses</option>
            <option value="1">Active</option>
            <option value="2">Inactive</option>
          </select>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <QueryErrorState
            title="Unable to load services"
            error={error}
            onRetry={refetch}
          />
        ) : providerServices.length === 0 ? (
          <TableEmptyState
            icon={faTag}
            title="No services found"
            hasActiveFilters={hasActiveFilters}
            emptyMessage="No services have been added for this provider yet."
          />
        ) : (
          <>
            <ScrollableTable className="scroll-table">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-medium text-slate-500">
                    <th className="px-6 py-3">Service</th>
                    <th className="px-4 py-3 text-right">Price before</th>
                    <th className="px-4 py-3 text-center">Discount</th>
                    <th className="px-4 py-3 text-right">Price after</th>
                    <th className="px-4 py-3 text-center">Offer</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    {canUpdate && (
                      <th className="px-6 py-3 text-center">Actions</th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {providerServices.map((service) => (
                    <tr
                      key={service.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      {/* Service (EN over AR) */}
                      <td className="px-6 py-3.5">
                        <div className="min-w-0 max-w-[300px] leading-tight">
                          <p className="truncate font-semibold text-slate-900">
                            {service.serviceNameEn}
                          </p>
                          {service.serviceNameAr && (
                            <p
                              dir="rtl"
                              lang="ar"
                              style={{ textAlign: "left" }}
                              className="mt-0.5 truncate text-xs text-slate-500"
                            >
                              {service.serviceNameAr}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Prices */}
                      <td className="whitespace-nowrap px-4 py-3.5 text-right tabular-nums text-slate-500">
                        {Number(service.priceBefore).toFixed(2)}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {service.discountPercentage ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium tabular-nums text-emerald-700">
                            {Number(service.discountPercentage)}%
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold tabular-nums text-slate-900">
                        {Number(service.priceAfter).toFixed(2)}
                      </td>

                      {/* Special offer */}
                      <td className="px-4 py-3.5 text-center">
                        {service.isSpecialOffer ? (
                          <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                            Special
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <StatusBadge isActive={service.isActive} />
                      </td>

                      {/* Joined */}
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                        {formatDate(service.createdAt)}
                      </td>

                      {/* Actions */}
                      {canUpdate && (
                        <td
                          className="px-6 py-3.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <IconButton
                              title="Edit service"
                              onClick={() => handleOpenEdit(service)}
                            >
                              <FontAwesomeIcon icon={faPenToSquare} />
                            </IconButton>

                            {service.isActive ? (
                              <IconButton
                                title="Deactivate service"
                                tone="red"
                                onClick={() => setServiceToToggle(service)}
                              >
                                <FontAwesomeIcon icon={faBan} />
                              </IconButton>
                            ) : (
                              <IconButton
                                title="Activate service"
                                tone="green"
                                onClick={() => setServiceToToggle(service)}
                              >
                                <FontAwesomeIcon icon={faCheck} />
                              </IconButton>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollableTable>

            <div className="border-t border-slate-100">
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
            </div>
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

      {canUpdate && (
        <ConfirmDeleteModal
          isOpen={!!serviceToToggle}
          variant={serviceToToggle?.isActive ? "danger" : "success"}
          title={
            serviceToToggle?.isActive ? "Deactivate service" : "Activate service"
          }
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
      )}
    </div>
  );
}