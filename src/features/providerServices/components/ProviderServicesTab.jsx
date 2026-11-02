import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faCalendarDays,
  faCheck,
  faPenToSquare,
  faPlus,
  faSearch,
  faTag,
  faTags,
  faTrashCan,
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
import PriceListFormModal from "./PriceListFormModal";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import usePermission from "../../auth/hooks/usePermission";
import { createProviderPriceList, deleteProviderPriceList, getProviderPriceListOptions, updateProviderPriceList } from "../services/priceListsService";
import Skeleton, { SkeletonTable } from "../../../shared/components/Skeleton";

const displayPeriodDate = (value) =>
  value && !Number.isNaN(new Date(value).getTime()) ? formatDate(value) : "-";

const getPriceListErrorMessage = (error) => {
  const response = error?.response?.data;
  const details = response?.errors;
  if (details && typeof details === "object") {
    const messages = Object.values(details).flat().filter(Boolean);
    if (messages.length > 0) return messages.join(" ");
  }

  return response?.message || error?.message || "";
};

function TableSkeleton({ rows = 6 }) {
  return (
    <SkeletonTable
      rows={rows}
      rowClassName="flex items-center gap-6 px-6 py-4"
    >
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-44 rounded bg-slate-100" />
        <Skeleton className="h-3 w-28 rounded bg-slate-100" />
      </div>
      <Skeleton className="hidden h-3 w-16 rounded bg-slate-100 md:block" />
      <Skeleton className="h-3 w-16 rounded bg-slate-100" />
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

export default function ProviderServicesTab() {
  const canViewPriceLists = usePermission(PERMISSION_CODES.PROVIDER_PRICE_LISTS_READ);
  const canCreatePriceList = usePermission(PERMISSION_CODES.PROVIDER_PRICE_LISTS_CREATE);
  const canUpdatePriceList = usePermission(PERMISSION_CODES.PROVIDER_PRICE_LISTS_UPDATE);
  const canDeletePriceList = usePermission(PERMISSION_CODES.PROVIDER_PRICE_LISTS_DELETE);
  const canViewServices = usePermission(PERMISSION_CODES.PROVIDER_SERVICES_READ);
  const canCreateService = usePermission(PERMISSION_CODES.PROVIDER_SERVICES_CREATE);
  const canUpdate = usePermission(PERMISSION_CODES.PROVIDER_SERVICES_UPDATE);
  const queryClient = useQueryClient();
  const { id: providerId } = useParams();

  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 400);

  const [statusFilter, setStatusFilter] = useState("");
  const [servicePriceListId, setServicePriceListId] = useState("");
  const [isPriceListModalOpen, setIsPriceListModalOpen] = useState(false);
  const [editingPriceList, setEditingPriceList] = useState(null);
  const [priceListToDelete, setPriceListToDelete] = useState(null);
  const {
    data: priceLists = [],
    isLoading: isLoadingPriceLists,
    isError: isPriceListsError,
    error: priceListsError,
    refetch: refetchPriceLists,
  } = useQuery({
    queryKey: ["provider-price-list-options", providerId],
    queryFn: () => getProviderPriceListOptions(providerId),
    enabled: canViewPriceLists && Boolean(providerId),
  });
  const selectedPriceListId = priceLists.some(
    (priceList) => String(priceList.id) === servicePriceListId
  )
    ? servicePriceListId
    : String(priceLists[0]?.id ?? "");
  const selectedPriceList = priceLists.find(
    (priceList) => String(priceList.id) === selectedPriceListId
  );

  const createPriceListMutation = useMutation({
    mutationFn: createProviderPriceList,
    onSuccess: (response) => {
      toast.success(response.message || "Price list created successfully.");
      if (response.data?.id != null) {
        setServicePriceListId(String(response.data.id));
      }
      queryClient.invalidateQueries({ queryKey: ["provider-price-list-options", providerId] });
      queryClient.invalidateQueries({ queryKey: ["provider-services"] });
      setIsPriceListModalOpen(false);
    },
  });

  const updatePriceListMutation = useMutation({
    mutationFn: updateProviderPriceList,
    onSuccess: (response) => {
      toast.success(response.message || "Price list updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["provider-price-list-options", providerId] });
      setIsPriceListModalOpen(false);
      setEditingPriceList(null);
    },
  });

  const deletePriceListMutation = useMutation({
    mutationFn: deleteProviderPriceList,
    onSuccess: (response, deletedId) => {
      toast.success(response.message || "Price list deleted successfully.");
      setServicePriceListId((currentId) =>
        String(currentId) === String(deletedId) ? "" : currentId
      );
      setPriceListToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["provider-price-list-options", providerId] });
      queryClient.invalidateQueries({ queryKey: ["provider-services"] });
    },
    onError: (error) => {
      toast.error(getPriceListErrorMessage(error) || "Failed to delete price list.");
    },
  });

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
    resetKey: `${search}|${statusFilter}|${selectedPriceListId}`,
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
    servicePriceListId: selectedPriceListId,
    enabled: canViewServices && (!canViewPriceLists || Boolean(selectedPriceListId)),
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
    if (!canCreateService || !canViewPriceLists || !selectedPriceListId) return;
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    if (!canUpdate || !canViewPriceLists) return;
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleSave = (payload) => {
    if (selectedService) {
      if (canUpdate && canViewPriceLists) updateMutation.mutate(payload);
    } else {
      if (canCreateService && canViewPriceLists && selectedPriceListId) createMutation.mutate(payload);
    }
  };

  const handleConfirmToggle = () => {
    if (canUpdate && canViewPriceLists && serviceToToggle) {
      toggleMutation.mutate(serviceToToggle);
    }
  };

  const count = totalCount ?? providerServices?.length ?? 0;

  return (
    <div className="min-w-0 space-y-5">
      {/* Price lists */}
      {canViewPriceLists && (
      <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-4 pt-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900 ring-1 ring-inset ring-blue-200/60">
              <FontAwesomeIcon icon={faTags} />
            </span>
            <div className="leading-tight">
              <h3 className="text-base font-semibold text-slate-900">
                Price lists
              </h3>
              <p className="text-xs text-slate-500">
                {priceLists.length > 0
                  ? `${priceLists.length} ${priceLists.length === 1 ? "period" : "periods"} · select one to manage its services`
                  : "Pricing periods for this provider"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canUpdatePriceList && selectedPriceList && (
              <button
                type="button"
                onClick={() => {
                  updatePriceListMutation.reset();
                  setEditingPriceList(selectedPriceList);
                  setIsPriceListModalOpen(true);
                }}
                aria-label={`Edit price list #${selectedPriceList.id}`}
                className="flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200 transition-all hover:bg-white hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <FontAwesomeIcon icon={faPenToSquare} className="text-slate-400" />
                Edit dates
              </button>
            )}
            {canDeletePriceList && selectedPriceList && (
              <button
                type="button"
                onClick={() => setPriceListToDelete(selectedPriceList)}
                aria-label={`Delete price list #${selectedPriceList.id}`}
                className="flex items-center gap-2 rounded-xl bg-red-50/60 px-3.5 py-2 text-sm font-medium text-red-600 ring-1 ring-inset ring-red-100 transition-all hover:bg-red-50 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
              >
                <FontAwesomeIcon icon={faTrashCan} />
                Delete
              </button>
            )}
            {canCreatePriceList && (
              <button
                type="button"
                onClick={() => {
                  createPriceListMutation.reset();
                  setEditingPriceList(null);
                  setIsPriceListModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-blue-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-800 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2"
              >
                <FontAwesomeIcon icon={faPlus} />
                Create price list
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
          {isLoadingPriceLists ? (
            <div className="flex gap-3" aria-busy="true">
              <Skeleton className="h-[68px] w-56 rounded-xl bg-slate-100" />
              <Skeleton className="hidden h-[68px] w-56 rounded-xl bg-slate-100 sm:block" />
            </div>
          ) : isPriceListsError ? (
            <p className="text-sm text-red-600">Unable to load price lists.</p>
          ) : priceLists.length === 0 ? (
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
              <FontAwesomeIcon icon={faCalendarDays} className="text-slate-400" />
              No price lists are available for this provider.
            </div>
          ) : (
            <nav
              aria-label="Price list periods"
              className="flex gap-3 overflow-x-auto pb-1"
            >
              {priceLists.map((priceList) => {
                const isSelected = String(priceList.id) === selectedPriceListId;
                return (
                  <button
                    key={priceList.id}
                    type="button"
                    aria-current={isSelected ? "page" : undefined}
                    onClick={() => setServicePriceListId(String(priceList.id))}
                    className={`group relative shrink-0 rounded-xl px-4 py-3 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 ${
                      isSelected
                        ? "bg-gradient-to-br from-blue-900 to-blue-800 text-white shadow-md shadow-blue-900/20"
                        : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:-translate-y-0.5 hover:shadow-sm hover:ring-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm ${
                          isSelected
                            ? "bg-white/15 text-white"
                            : "bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-700"
                        }`}
                      >
                        <FontAwesomeIcon icon={faCalendarDays} />
                      </span>
                      <span className="block leading-tight">
                        <span
                          className={`block text-[11px] font-semibold uppercase tracking-wide ${
                            isSelected ? "text-blue-100" : "text-slate-400"
                          }`}
                        >
                          Price list #{priceList.id}
                        </span>
                        <span className="mt-1 block whitespace-nowrap text-sm font-semibold">
                          {displayPeriodDate(priceList.startAt)}
                          <span
                            className={`mx-1.5 font-normal ${
                              isSelected ? "text-blue-200" : "text-slate-300"
                            }`}
                          >
                            →
                          </span>
                          {displayPeriodDate(priceList.endAt)}
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </section>
      )}

      {canViewServices && (
      <>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Services</h2>
          <p className="text-sm text-slate-500">
            {isLoading || isError || isLoadingPriceLists || isPriceListsError
              ? "Manage prices, discounts and offers."
              : `${count} ${count === 1 ? "service" : "services"}${
                  hasActiveFilters ? " match your filters" : " in total"
                }`}
          </p>
        </div>

        {canViewPriceLists && canCreateService && (
          <button
            type="button"
            onClick={handleOpenAdd}
            disabled={!selectedPriceListId}
            className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add service
          </button>
        )}
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

        {canViewPriceLists && isLoadingPriceLists ? (
          <TableSkeleton />
        ) : canViewPriceLists && isPriceListsError ? (
          <QueryErrorState
            title="Unable to load price lists"
            error={priceListsError}
            onRetry={refetchPriceLists}
          />
        ) : canViewPriceLists && !selectedPriceListId ? (
          <TableEmptyState
            icon={faTag}
            title="No price lists found"
            emptyMessage="No price lists are available for this provider."
          />
        ) : isLoading ? (
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
                  <tr className="border-b border-slate-100 bg-slate-100 text-xs font-medium text-slate-500">
                    <th className="px-6 py-3">Service</th>
                    <th className="px-4 py-3 text-right">Price before</th>
                    <th className="px-4 py-3 text-center">Discount</th>
                    <th className="px-4 py-3 text-right">Price after</th>
                    <th className="px-4 py-3 text-center">Offer</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    {canUpdate && canViewPriceLists && (
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
                      {canUpdate && canViewPriceLists && (
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

      </>
      )}

      {canViewPriceLists && (canCreatePriceList || canUpdatePriceList) && (
      <PriceListFormModal
        isOpen={isPriceListModalOpen}
        priceList={editingPriceList}
        providerId={providerId}
        hasPriceLists={priceLists.length > 0}
        onSave={(payload) => {
          if (editingPriceList && canUpdatePriceList) updatePriceListMutation.mutate(payload);
          else if (!editingPriceList && canCreatePriceList) createPriceListMutation.mutate(payload);
        }}
        onClose={() => setIsPriceListModalOpen(false)}
        isSaving={createPriceListMutation.isPending || updatePriceListMutation.isPending}
        serverError={getPriceListErrorMessage(
          editingPriceList ? updatePriceListMutation.error : createPriceListMutation.error
        )}
      />
      )}

      {canViewPriceLists && canDeletePriceList && (
        <ConfirmDeleteModal
          isOpen={Boolean(priceListToDelete)}
          title="Delete price list"
          message={`Are you sure you want to delete price list #${priceListToDelete?.id} (${displayPeriodDate(priceListToDelete?.startAt)} - ${displayPeriodDate(priceListToDelete?.endAt)})?`}
          confirmLabel="Delete price list"
          onConfirm={() => {
            if (canDeletePriceList && priceListToDelete) deletePriceListMutation.mutate(priceListToDelete.id);
          }}
          onCancel={() => setPriceListToDelete(null)}
          isLoading={deletePriceListMutation.isPending}
        />
      )}

      {canViewServices && canViewPriceLists && (canCreateService || canUpdate) && (
      <ProviderServiceFormModal
        isOpen={isModalOpen}
        providerService={selectedService}
        providerId={providerId}
        servicePriceListId={selectedPriceListId}
        priceListLabel={selectedPriceList
          ? `${displayPeriodDate(selectedPriceList.startAt)} - ${displayPeriodDate(selectedPriceList.endAt)}`
          : ""}
        onSave={handleSave}
        onClose={() => setIsModalOpen(false)}
        isSaving={isSaving}
        serverErrors={serverErrors}
        onClearErrors={clearServerErrors}
      />
      )}

      {canViewServices && canViewPriceLists && canUpdate && (
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
