import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faBuilding,
  faImage,
  faStethoscope,
  faTags,
} from "@fortawesome/free-solid-svg-icons";
import QueryErrorState from "../../../localization/ProviderDetailsQueryErrorState";
import StatusBadge from "../../providers/components/StatusBadge";
import { useProviderPackageDetailsQuery } from "../hooks/useProviderPackageDetailsQuery";
import ProviderPackageFormModal from "./ProviderPackageFormModal";
import {
  formatPrice,
  getDiscountPercent,
  hasDiscount,
} from "../utils/packageUtils";
import Skeleton from "../../../shared/components/Skeleton";
import useProviderDetailsText from "../../../localization/useProviderDetailsText";
import useLanguage from "../../../localization/useLanguage";

const CLOSE_ANIMATION_MS = 250;

function Section({ icon, title, count, children }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <FontAwesomeIcon icon={icon} className="text-sm text-slate-400" />
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        {count != null && (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-600">
            {count}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function InfoField({ label, children, dir, lang, pageRtl = false }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className="mt-1.5 break-words text-sm leading-relaxed text-slate-800"
        dir={dir}
        lang={lang}
        style={dir === "rtl" ? { textAlign: pageRtl ? "right" : "left" } : undefined}
      >
        {children || <span className="text-slate-400">-</span>}
      </p>
    </div>
  );
}

function PackageImage({ label, src }) {
  const tr = useProviderDetailsText();
  return (
    <figure className="min-w-0">
      <div className="flex h-44 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        {src ? (
          <img src={src} alt={label} className="h-full w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-300">
            <FontAwesomeIcon icon={faImage} className="text-2xl" />
            <span className="text-xs text-slate-400">{tr("No image available")}</span>
          </div>
        )}
      </div>
      <figcaption className="mt-2 text-center text-xs font-medium text-slate-500">
        {label}
      </figcaption>
    </figure>
  );
}

function DetailsSkeleton() {
  return (
    <div className="space-y-6 p-5 sm:p-6" aria-busy="true">
      <div className="flex items-start gap-4">
        <Skeleton className="h-14 w-14 rounded-2xl bg-slate-100" />
        <div className="flex-1 space-y-2.5">
          <Skeleton className="h-4 w-2/3 rounded bg-slate-100" />
          <Skeleton className="h-3 w-1/3 rounded bg-slate-100" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full bg-slate-100" />
      </div>
      <Skeleton className="h-24 rounded-2xl bg-slate-100" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-20 rounded-xl bg-slate-100" />
        <Skeleton className="h-20 rounded-xl bg-slate-100" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-44 rounded-xl bg-slate-100" />
        <Skeleton className="h-44 rounded-xl bg-slate-100" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-12 rounded-xl bg-slate-100" />
        <Skeleton className="h-12 rounded-xl bg-slate-100" />
        <Skeleton className="h-12 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

export default function ProviderPackageDetailsModal({
  packageId,
  initialMode = "details",
  providerId,
  canUpdate = false,
  onSave,
  onClose,
  isSaving,
  serverErrors,
}) {
  const tr = useProviderDetailsText();
  const { language } = useLanguage();
  const rtl = language === "ar";
  const { data: providerPackage, isLoading, isError, error, refetch } =
    useProviderPackageDetailsQuery(packageId, language);
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const closeTimerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState(initialMode);
  const isEditing = mode === "edit" && canUpdate;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const closeThen = useCallback((callback) => {
    setIsOpen(false);
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(callback, CLOSE_ANIMATION_MS);
  }, []);

  const requestClose = useCallback(() => {
    closeThen(() => onCloseRef.current());
  }, [closeThen]);

  const handleEdit = () => {
    if (canUpdate && providerPackage) setMode("edit");
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsOpen(true));
    const handleKeyDown = (event) => {
      if (event.key === "Escape") requestClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(closeTimerRef.current);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [requestClose]);

  const percent = providerPackage
    ? getDiscountPercent(providerPackage.totalDiscount)
    : null;
  const discounted = providerPackage
    ? hasDiscount(providerPackage.totalDiscount)
    : false;
  const hasImages = Boolean(providerPackage?.imageEn || providerPackage?.imageAr);
  const services = providerPackage?.services ?? [];

  return (
    <div
      className={`fixed inset-0 z-[200] flex ${rtl ? "justify-start" : "justify-end"} bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onClick={!isEditing ? requestClose : undefined}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="provider-package-details-title"
        className={`flex h-full w-full max-w-xl transform flex-col overflow-hidden bg-white shadow-2xl outline-none transition-transform duration-300 ease-out motion-reduce:transition-none ${rtl ? "sm:rounded-r-2xl" : "sm:rounded-l-2xl"} ${
          isOpen ? "translate-x-0" : rtl ? "-translate-x-full" : "translate-x-full"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="provider-package-details-title"
              className="text-lg font-semibold text-slate-900"
            >
              {tr(isEditing ? "Edit package" : "Package details")}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {tr("Package #{{id}}", { id: packageId })}
            </p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label={tr(isEditing ? "Close edit package" : "Close package details")}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <X size={20} />
          </button>
        </div>

        {isEditing ? (
          isLoading ? (
            <DetailsSkeleton />
          ) : isError || !providerPackage ? (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <QueryErrorState
                title={tr("Unable to load package details")}
                error={error}
                onRetry={refetch}
              />
            </div>
          ) : (
            <ProviderPackageFormModal
              key={providerPackage.packageId}
              variant="drawer"
              providerId={providerId}
              providerPackage={providerPackage}
              onSave={onSave}
              onClose={requestClose}
              isSaving={isSaving}
              serverErrors={serverErrors}
            />
          )
        ) : (
          <>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <DetailsSkeleton />
          ) : isError || !providerPackage ? (
            <QueryErrorState
              title={tr("Unable to load package details")}
              error={error}
              onRetry={refetch}
            />
          ) : (
            <div className="space-y-7 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-900">
                  <FontAwesomeIcon icon={faBoxOpen} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-lg font-semibold leading-snug text-slate-900">
                     {(rtl ? providerPackage.packageArName || providerPackage.packageEnName : providerPackage.packageEnName || providerPackage.packageArName) || "-"}
                  </h3>
                  {providerPackage.packageEnName &&
                    providerPackage.packageArName && (
                      <p
                         dir={rtl ? "ltr" : "rtl"}
                         lang={rtl ? "en" : "ar"}
                         className="mt-1 break-words text-start text-sm text-slate-500"
                      >
                         {rtl ? providerPackage.packageEnName : providerPackage.packageArName}
                      </p>
                    )}
                </div>
                 <StatusBadge isActive={providerPackage.isActive} activeLabel={tr("Active")} inactiveLabel={tr("Inactive")} />
              </div>

              <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-900/60">
                     {tr("Price after")}
                  </p>
                  <p className="mt-1 text-3xl font-bold tabular-nums text-blue-900">
                    {formatPrice(providerPackage.priceAfter)}
                  </p>
                </div>
                {discounted ? (
                   <div className="text-end">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                       {tr("Price before")}
                    </p>
                    <p className="mt-1 text-base tabular-nums text-slate-400 line-through">
                      {formatPrice(providerPackage.priceBefore)}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
                      <FontAwesomeIcon icon={faTags} className="text-[10px]" />
                       {percent != null ? `${tr("{{percent}}% off", { percent })} · ` : ""}
                       {tr("Save {{amount}}", { amount: formatPrice(providerPackage.priceBefore - providerPackage.priceAfter) })}
                    </span>
                  </div>
                ) : (
                   <div className="text-end">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                       {tr("Price before")}
                    </p>
                    <p className="mt-1 text-base tabular-nums text-slate-500">
                      {formatPrice(providerPackage.priceBefore)}
                    </p>
                  </div>
                )}
              </div>

               <Section icon={faBuilding} title={tr("Provider & description")}>
                <div className="grid gap-3 sm:grid-cols-2">
                   <InfoField label={tr("Provider (English)")}>
                    {providerPackage.providerEnName}
                  </InfoField>
                   <InfoField label={tr("Provider (Arabic)")} dir="rtl" lang="ar" pageRtl={rtl}>
                    {providerPackage.providerArName}
                  </InfoField>
                   <InfoField label={tr("Description (English)")}>
                    {providerPackage.descriptionEn}
                  </InfoField>
                   <InfoField label={tr("Description (Arabic)")} dir="rtl" lang="ar" pageRtl={rtl}>
                    {providerPackage.descriptionAr}
                  </InfoField>
                </div>
              </Section>

              {hasImages && (
                 <Section icon={faImage} title={tr("Images")}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <PackageImage
                       label={tr("English image")}
                      src={providerPackage.imageEn}
                    />
                    <PackageImage
                       label={tr("Arabic image")}
                      src={providerPackage.imageAr}
                    />
                  </div>
                </Section>
              )}

              <Section
                icon={faStethoscope}
                 title={tr("Services")}
                count={services.length}
              >
                {services.length ? (
                  <ol className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
                    {services.map((service, index) => (
                      <li
                        key={service.serviceId}
                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold tabular-nums text-slate-600">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1 leading-tight">
                          <p className="truncate text-sm font-medium text-slate-800">
                             {(rtl ? service.serviceArName || service.serviceEnName : service.serviceEnName || service.serviceArName) || "-"}
                          </p>
                          {service.serviceEnName && service.serviceArName && (
                            <p
                               dir={rtl ? "ltr" : "rtl"}
                               lang={rtl ? "en" : "ar"}
                               className="mt-0.5 truncate text-start text-xs text-slate-500"
                            >
                               {rtl ? service.serviceEnName : service.serviceArName}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                     {tr("No services in this package.")}
                  </div>
                )}
              </Section>
            </div>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6">
          <button
            type="button"
            onClick={requestClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2"
          >
             {tr("Close")}
          </button>
          {providerPackage && canUpdate && onSave && (
            <button
              type="button"
              onClick={handleEdit}
              className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2"
            >
               {tr("Edit package")}
            </button>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}
