import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faArrowUpRightFromSquare, faImage, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import ClientAvatar from "../../../shared/components/ClientAvatar";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import Skeleton from "../../../shared/components/Skeleton";
import StatusBadge from "../../../shared/components/StatusBadge";
import { getApiErrorMessage } from "../../../shared/helpers/apiErrorHandler";
import { formatDateTimeShort } from "../../../utils/formatDate";
import ProcessPrescriptionForm from "../components/ProcessPrescriptionForm";
import RejectPrescriptionForm from "../components/RejectPrescriptionForm";
import ProcessedPrescriptionItems from "../components/ProcessedPrescriptionItems";
import { usePrescriptionDetailsQuery } from "../hooks/usePrescriptionDetailsQuery";
import { useProcessManualPrescriptionMutation } from "../hooks/useProcessManualPrescriptionMutation";
import { useRejectManualPrescriptionMutation } from "../hooks/useRejectManualPrescriptionMutation";
import usePermission from "../../auth/hooks/usePermission";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import LocalizedPage from "../../../localization/LocalizedPage";
import useLanguage from "../../../localization/useLanguage";
import usePrescriptionsText from "../../../localization/usePrescriptionsText";

const statusTone = { Pending: "warning", Processed: "success", Rejected: "danger" };

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-start text-sm text-slate-800" dir="auto">{children ?? "—"}</dd>
    </div>
  );
}

function PrescriptionImagePanel({ prescription, onRefresh, isRefreshing }) {
  const t = usePrescriptionsText();
  const [hasError, setHasError] = useState(false);

  return (
    <section aria-label={t("Prescription image")} className="overflow-hidden rounded-2xl border border-slate-200 bg-white lg:sticky lg:top-0">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-800">{t("Prescription image")}</h2>
        {prescription.imageUrl && (
          <a href={prescription.imageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-800 hover:underline">
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} /> {t("Open original")}
          </a>
        )}
      </div>
      <div className="flex h-[60vh] min-h-80 items-center justify-center bg-slate-100 p-3 sm:p-5 lg:h-[calc(100dvh-14rem)]">
        {!prescription.imageUrl || hasError ? (
          <div className="space-y-3 p-5 text-center text-sm text-slate-500">
            <FontAwesomeIcon icon={faImage} className="text-4xl text-slate-300" />
            <p>{t(hasError ? "Unable to load the prescription image." : "No prescription image attached.")}</p>
            {hasError && (
              <button type="button" onClick={() => { setHasError(false); onRefresh(); }} disabled={isRefreshing} className="font-medium text-blue-800 underline disabled:opacity-50">
                {t("Refresh image")}
              </button>
            )}
          </div>
        ) : (
          <img
            src={prescription.imageUrl}
            alt={t("Prescription #{{id}}", { id: prescription.id })}
            onError={() => setHasError(true)}
            className="max-h-full max-w-full rounded-lg object-contain shadow-sm"
          />
        )}
      </div>
    </section>
  );
}

export default function PrescriptionDetailsPage() {
  const t = usePrescriptionsText();
  const { language, direction } = useLanguage();
  const rtl = direction === "rtl";
  const { manualPrescriptionId } = useParams();
  const navigate = useNavigate();
  const canViewClients = usePermission(PERMISSION_CODES.CLIENTS_READ);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageRef = useRef(null);
  const {
    data: prescription, isPending, isError, error, isFetching, refetch,
  } = usePrescriptionDetailsQuery({ manualPrescriptionId, language });
  const closeForm = () => setSearchParams({}, { replace: true });
  const processMutation = useProcessManualPrescriptionMutation({ onSuccess: closeForm, t });
  const rejectMutation = useRejectManualPrescriptionMutation({ onSuccess: closeForm, t });
  const isSaving = processMutation.isPending || rejectMutation.isPending;
  const action = prescription?.status === "Pending" ? searchParams.get("action") : null;
  const isValidId = Number.isSafeInteger(Number(manualPrescriptionId)) && Number(manualPrescriptionId) > 0;
  const requestErrorMessage = error?.response?.data?.message || error?.response?.data?.errors
    ? getApiErrorMessage(error, { details: true, fallback: t("Unable to load prescription") })
    : t("Unable to load prescription");

  useEffect(() => {
    pageRef.current?.closest("main")?.scrollTo({ top: 0 });
  }, [manualPrescriptionId]);

  return (
    <LocalizedPage>
    <div ref={pageRef} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/prescriptions")}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg px-1 py-2 text-sm font-medium text-slate-600 hover:text-blue-800 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={rtl ? faArrowRight : faArrowLeft} /> {t("Back to prescriptions")}
        </button>
        <button type="button" onClick={() => refetch()} disabled={isFetching || isSaving || !isValidId} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50">
          <FontAwesomeIcon icon={faRotateRight} spin={isFetching} /> {t("Refresh")}
        </button>
      </div>

      {!isValidId ? (
        <p role="status" className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">{t("Prescription not found.")}</p>
      ) : isPending ? (
        <Skeleton label={t("Loading prescription...")} className="grid gap-6 lg:grid-cols-2">
          <div className="h-[60vh] rounded-2xl bg-slate-200" />
          <div className="space-y-4"><div className="h-40 rounded-2xl bg-slate-200" /><div className="h-48 rounded-2xl bg-slate-200" /></div>
        </Skeleton>
      ) : isError && !prescription ? (
        <QueryErrorState title={t("Unable to load prescription")} error={error} onRetry={refetch}
          loadErrorMessage={t("We couldn't load the data. Please try again.")}
          connectionErrorMessage={t("We couldn't connect to the server. Please check your internet connection and try again.")}
          retryLabel={t("Try Again")} />
      ) : !prescription ? (
        <p role="status" className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">{t("Prescription not found. It may no longer be available.")}</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <h1 id="prescription-details-heading" className="text-2xl font-bold text-slate-900">{t("Prescription #{{id}}", { id: prescription.id })}</h1>
            <StatusBadge tone={statusTone[prescription.status] || "neutral"}>{prescription.status || t("Unknown")}</StatusBadge>
          </div>
          {isError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{requestErrorMessage}</p>}

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(22rem,1fr)]">
            <PrescriptionImagePanel key={prescription.imageUrl || "no-image"} prescription={prescription} onRefresh={refetch} isRefreshing={isFetching} />

            <div aria-label={t("Prescription data")} className="min-w-0 space-y-5">
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-slate-900">{t("Customer details")}</h2>
                  {canViewClients && prescription.customerId && (
                    <Link to={`/clients/${prescription.customerId}?tab=orders`} title={t("View client order history")} className="text-sm font-medium text-blue-800 hover:underline">
                      {t("Order History")}
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <ClientAvatar name={prescription.customerFullName} colorSeed={prescription.customerId} sizeClass="h-11 w-11" textClass="text-sm" />
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-slate-900" dir="auto">{prescription.customerFullName || t("Unknown customer")}</p>
                    {prescription.phoneNumber && <a href={`tel:${prescription.phoneNumber}`} dir="ltr" className="mt-0.5 inline-block text-sm tabular-nums text-blue-800 hover:underline">{prescription.phoneNumber}</a>}
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <Detail label={t("Customer ID")}>{prescription.customerId}</Detail>
                  <Detail label={t("Submitted")}>{formatDateTimeShort(prescription.createdAt)}</Detail>
                </dl>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="mb-2 text-sm font-semibold text-slate-900">{t("Prescription text")}</h2>
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-600" dir="auto">{prescription.text || t("No text provided.")}</p>
              </section>

              <ProcessedPrescriptionItems items={prescription.items} />

              {(action === "process" || action === "reject") && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  {action === "process" ? (
                    <ProcessPrescriptionForm key={prescription.id} prescription={prescription} onClose={closeForm} onProcess={(payload) => processMutation.mutate(payload)} onClearErrors={() => processMutation.reset()} isSaving={processMutation.isPending} error={processMutation.error} />
                  ) : (
                    <RejectPrescriptionForm key={prescription.id} prescription={prescription} onClose={closeForm} onReject={(payload) => rejectMutation.mutate(payload)} isSaving={rejectMutation.isPending} error={rejectMutation.error} />
                  )}
                </section>
              )}

              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">{t("Review details")}</h2>
                <dl className="grid grid-cols-2 gap-4">
                  <Detail label={t("Reviewed by")}>{prescription.reviewedByEmployeeFullName}</Detail>
                  <Detail label={t("Reviewed at")}>{formatDateTimeShort(prescription.reviewedAt)}</Detail>
                </dl>
                {prescription.rejectionReason && (
                  <div className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">
                    <p className="text-xs font-semibold">{t("Rejection reason")}</p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm" dir="auto">{prescription.rejectionReason}</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </>
      )}
    </div>
    </LocalizedPage>
  );
}
