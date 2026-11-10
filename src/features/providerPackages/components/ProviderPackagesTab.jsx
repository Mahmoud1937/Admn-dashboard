import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBan,
  faBoxOpen,
  faCheck,
  faPen,
  faPlus,
  faStethoscope,
  faTags,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import Pagination from "../../../shared/components/Pagination";
import QueryErrorState from "../../../localization/ProviderDetailsQueryErrorState";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import StatusBadge from "../../providers/components/StatusBadge";
import { useProviderPackagesQuery } from "../hooks/useProviderPackagesQuery";
import { useProviderPackageCreateMutation } from "../hooks/useProviderPackageCreateMutation";
import { useProviderPackageUpdateMutation } from "../hooks/useProviderPackageUpdateMutation";
import { useProviderPackageActionsMutation } from "../hooks/useProviderPackageActionsMutation";
import {
  formatPrice,
  getDiscountPercent,
  hasDiscount,
} from "../utils/packageUtils";
import ProviderPackageFormModal from "./ProviderPackageFormModal";
import ProviderPackageDetailsModal from "./ProviderPackageDetailsModal";
import usePermission from "../../auth/hooks/usePermission";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import Skeleton from "../../../shared/components/Skeleton";
import useProviderDetailsText from "../../../localization/useProviderDetailsText";
import useLanguage from "../../../localization/useLanguage";


function CardsSkeleton({ count = 6 }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="h-11 w-11 rounded-xl bg-slate-100" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-3/4 rounded bg-slate-100" />
              <Skeleton className="h-3 w-1/2 rounded bg-slate-100" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full bg-slate-100" />
          </div>
          <Skeleton className="mt-6 h-8 w-32 rounded bg-slate-100" />
          <div className="mt-6 h-px bg-slate-100" />
          <Skeleton className="mt-4 h-3 w-24 rounded bg-slate-100" />
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Skeleton className="h-9 rounded-lg bg-slate-100" />
            <Skeleton className="h-9 rounded-lg bg-slate-100" />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Skeleton className="h-9 rounded-lg bg-slate-100" />
            <Skeleton className="h-9 rounded-lg bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PackageCard({ providerPackage, onView, onEdit, onToggle, onDelete, canUpdate, canDelete }) {
  const tr = useProviderDetailsText();
  const { language } = useLanguage();
  const rtl = language === "ar";
  const percent = getDiscountPercent(providerPackage.totalDiscount);
  const discounted = hasDiscount(providerPackage.totalDiscount);
  const isActive = Boolean(providerPackage.isActive);

  return (
    <article
      className={`group flex flex-col rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${
        isActive
          ? "border-slate-200 bg-white shadow-sm hover:border-blue-200 hover:shadow-md"
          : "border-dashed border-slate-300 bg-slate-50/80 hover:border-slate-400"
      }`}
    >
      <header className="flex items-start gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
            isActive
              ? "bg-blue-50 text-blue-900 group-hover:bg-blue-900 group-hover:text-white"
              : "bg-slate-200/70 text-slate-400 group-hover:bg-slate-300 group-hover:text-slate-600"
          }`}
        >
          <FontAwesomeIcon icon={faBoxOpen} />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <h3
            className={`truncate font-semibold ${
              isActive ? "text-slate-900" : "text-slate-500"
            }`}
            title={(rtl ? providerPackage.packageArName : providerPackage.packageEnName) || undefined}
          >
            {(rtl ? providerPackage.packageArName || providerPackage.packageEnName : providerPackage.packageEnName || providerPackage.packageArName) || "-"}
          </h3>
          {(rtl ? providerPackage.packageEnName : providerPackage.packageArName) && (
            <p
              dir={rtl ? "ltr" : "rtl"}
              lang={rtl ? "en" : "ar"}
              className="mt-1 truncate text-start text-xs text-slate-500"
              title={rtl ? providerPackage.packageEnName : providerPackage.packageArName}
            >
              {rtl ? providerPackage.packageEnName : providerPackage.packageArName}
            </p>
          )}
        </div>
        <StatusBadge isActive={providerPackage.isActive} activeLabel={tr("Active")} inactiveLabel={tr("Inactive")} />
      </header>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {tr("Price after")}
          </p>
          <p
            className={`mt-1 text-2xl font-bold tabular-nums ${
              isActive ? "text-slate-900" : "text-slate-400"
            }`}
          >
            {formatPrice(providerPackage.priceAfter)}
          </p>
        </div>
        {discounted && (
          <div className="text-end">
            <p className="text-sm tabular-nums text-slate-400 line-through">
              {formatPrice(providerPackage.priceBefore)}
            </p>
            <span
              className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <FontAwesomeIcon icon={faTags} className="text-[10px]" />
              {percent != null
                ? tr("{{percent}}% off", { percent })
                : `-${formatPrice(providerPackage.totalDiscount)}`}
            </span>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
        <span className="flex items-center gap-2 text-slate-500">
          <FontAwesomeIcon icon={faStethoscope} className="text-slate-400" />
          {tr("Services")}
        </span>
        <span
          className={`rounded-md px-2.5 py-0.5 text-xs font-semibold tabular-nums ${
            isActive
              ? "bg-slate-100 text-slate-700"
              : "bg-slate-200/60 text-slate-500"
          }`}
        >
          {providerPackage.totalServiceCount ?? "-"}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <div className={`grid gap-2 ${canUpdate ? "grid-cols-2" : "grid-cols-1"}`}>
          <button
            type="button"
            onClick={() => onView(providerPackage.packageId)}
            className={`flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 ${
              isActive
                ? "bg-blue-900 text-white shadow-sm hover:bg-blue-800"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {tr("View details")}
            <FontAwesomeIcon
              icon={faArrowRight}
              className={`text-xs transition-transform ${rtl ? "rotate-180 group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`}
            />
          </button>
          {canUpdate && <button
            type="button"
            onClick={() => onEdit(providerPackage)}
            className="flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-blue-200 bg-white px-3 text-[13px] font-medium text-blue-900 transition-colors hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2"
          >
            <FontAwesomeIcon icon={faPen} className="text-xs text-blue-400" />
            {tr("Edit")}
          </button>}
        </div>

        {(canUpdate || canDelete) && <div className={`grid gap-2 ${canUpdate && canDelete ? "grid-cols-2" : "grid-cols-1"}`}>
          {canUpdate && <button
            type="button"
            onClick={() => onToggle(providerPackage)}
            className="flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
          >
            <FontAwesomeIcon
              icon={providerPackage.isActive ? faBan : faCheck}
              className="text-xs text-slate-400"
            />
            {tr(providerPackage.isActive ? "Deactivate" : "Activate")}
          </button>}
          {canDelete && <button
            type="button"
            onClick={() => onDelete(providerPackage)}
            className="flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-red-200 bg-white px-3 text-[13px] font-medium text-red-700 transition-colors hover:border-red-300 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
          >
            <FontAwesomeIcon icon={faTrash} className="text-xs text-red-400" />
            {tr("Delete")}
          </button>}
        </div>}
      </div>
    </article>
  );
}

export default function ProviderPackagesTab() {
  const tr = useProviderDetailsText();
  const { language } = useLanguage();
  const { id: providerId } = useParams();
  const canRead = usePermission(PERMISSION_CODES.PROVIDER_PACKAGES_READ);
  const canCreate = usePermission(PERMISSION_CODES.PROVIDER_PACKAGES_CREATE);
  const canUpdate = usePermission(PERMISSION_CODES.PROVIDER_PACKAGES_UPDATE);
  const canDelete = usePermission(PERMISSION_CODES.PROVIDER_PACKAGES_DELETE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openPackage, setOpenPackage] = useState(null);
  const [packageToToggle, setPackageToToggle] = useState(null);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination({ resetKey: providerId });
  const {
    packages,
    totalCount,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
  } = useProviderPackagesQuery({ providerId, pageNumber, pageSize, enabled: canRead, language });
  const { mutation, serverErrors, clearServerErrors } =
    useProviderPackageCreateMutation({ onSuccess: () => setIsModalOpen(false) });
  const {
    mutation: updateMutation,
    serverErrors: updateServerErrors,
    clearServerErrors: clearUpdateServerErrors,
  } = useProviderPackageUpdateMutation({
    onSuccess: () => setOpenPackage(null),
  });
  const { toggleMutation, deleteMutation } = useProviderPackageActionsMutation({
    onToggleSuccess: () => setPackageToToggle(null),
    onDeleteSuccess: () => setPackageToDelete(null),
  });

  const closeCreateModal = () => {
    clearServerErrors();
    setIsModalOpen(false);
  };

  const closePackageDrawer = () => {
    clearUpdateServerErrors();
    setOpenPackage(null);
  };

  const openPackageDrawer = (packageId, mode) => {
    if (!canRead || (mode === "edit" && !canUpdate)) return;
    clearUpdateServerErrors();
    setOpenPackage({ packageId, mode });
  };

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{tr("Packages")}</h2>
          <p className="text-sm text-slate-500">
            {isLoading || isError
              ? tr("Manage this provider's packages.")
              : tr(totalCount === 1 ? "{{total}} package in total" : "{{total}} packages in total", { total: totalCount })}
          </p>
        </div>
        {canCreate && <button
          type="button"
          onClick={() => {
            clearServerErrors();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          {tr("Add package")}
        </button>}
      </div>

      {isLoading ? (
        <CardsSkeleton />
      ) : isError ? (
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <QueryErrorState
            title={tr("Unable to load packages")}
            error={error}
            onRetry={refetch}
          />
        </div>
      ) : packages.length === 0 ? (
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <TableEmptyState
            icon={faBoxOpen}
            title={tr("No packages found")}
            emptyMessage={tr("No packages have been added for this provider yet.")}
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {packages.map((providerPackage) => (
              <PackageCard
                key={providerPackage.packageId}
                providerPackage={providerPackage}
                onView={(packageId) => openPackageDrawer(packageId, "details")}
                onEdit={(item) => openPackageDrawer(item.packageId, "edit")}
                onToggle={setPackageToToggle}
                onDelete={setPackageToDelete}
                canUpdate={canUpdate}
                canDelete={canDelete}
              />
            ))}
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Pagination
              pageNumber={pageNumber}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              itemLabel={tr("packages")}
              summary={tr("Showing page {{page}} of {{totalPages}} ({{total}} packages)", { page: pageNumber, totalPages, total: totalCount })}
              rowsPerPageLabel={tr("Rows per page")}
              previousLabel={tr("Previous")}
              nextLabel={tr("Next")}
              getPageNumbers={getPageNumbers}
              onGoToPage={(page) => goToPage(page, totalPages)}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </>
      )}

      {isModalOpen && canCreate && (
        <ProviderPackageFormModal
          providerId={providerId}
          onSave={(payload) => {
            if (canCreate) mutation.mutate(payload);
          }}
          onClose={closeCreateModal}
          isSaving={mutation.isPending}
          serverErrors={serverErrors}
        />
      )}
      {openPackage && canRead && (
        <ProviderPackageDetailsModal
          key={openPackage.packageId}
          packageId={openPackage.packageId}
          initialMode={openPackage.mode}
          providerId={providerId}
          canUpdate={canUpdate}
          onSave={(payload) => {
            if (canUpdate) updateMutation.mutate(payload);
          }}
          onClose={closePackageDrawer}
          isSaving={updateMutation.isPending}
          serverErrors={updateServerErrors}
        />
      )}
      {canUpdate && <ConfirmDeleteModal
        isOpen={!!packageToToggle}
        variant={packageToToggle?.isActive ? "danger" : "success"}
        title={tr(packageToToggle?.isActive ? "Deactivate package?" : "Activate package?")}
        message={tr(packageToToggle?.isActive ? "Are you sure you want to deactivate \"{{name}}\"?" : "Are you sure you want to activate \"{{name}}\"?", { name: (language === "ar" ? packageToToggle?.packageArName || packageToToggle?.packageEnName : packageToToggle?.packageEnName || packageToToggle?.packageArName) || tr("this package") })}
        confirmLabel={tr(packageToToggle?.isActive ? "Deactivate" : "Activate")}
        cancelLabel={tr("Cancel")}
        loadingLabel={tr("Processing...")}
        isLoading={toggleMutation.isPending}
        onConfirm={() => {
          if (canUpdate && packageToToggle) toggleMutation.mutate(packageToToggle.packageId);
        }}
        onCancel={() => setPackageToToggle(null)}
      />}
      {canDelete && <ConfirmDeleteModal
        isOpen={!!packageToDelete}
        title={tr("Delete package?")}
        message={tr("Are you sure you want to permanently delete \"{{name}}\"? This cannot be undone.", { name: (language === "ar" ? packageToDelete?.packageArName || packageToDelete?.packageEnName : packageToDelete?.packageEnName || packageToDelete?.packageArName) || tr("this package") })}
        confirmLabel={tr("Delete")}
        cancelLabel={tr("Cancel")}
        loadingLabel={tr("Processing...")}
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (canDelete && packageToDelete) deleteMutation.mutate(packageToDelete.packageId);
        }}
        onCancel={() => setPackageToDelete(null)}
      />}
    </div>
  );
}
