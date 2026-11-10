import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import FormActions from "../../../shared/components/FormActions";
import { getApiErrorMessage } from "../../../shared/helpers/apiErrorHandler";
import useLanguage from "../../../localization/useLanguage";
import usePrescriptionsText from "../../../localization/usePrescriptionsText";

export default function RejectPrescriptionForm({ prescription, onClose, onReject, isSaving, error }) {
  const t = usePrescriptionsText();
  const { direction } = useLanguage();
  const [rejectionReason, setRejectionReason] = useState("");
  const [validationError, setValidationError] = useState("");
  const feedbackRef = useRef(null);

  useEffect(() => {
    if (error || validationError) feedbackRef.current?.scrollIntoView({ block: "end" });
  }, [error, validationError]);

  const submit = (event) => {
    event.preventDefault();
    if (isSaving) return;
    const reason = rejectionReason.trim();
    if (!reason) {
      setValidationError("Enter a reason for rejecting this prescription.");
      return;
    }

    setValidationError("");
    onReject({ manualPrescriptionId: prescription.id, rejectionReason: reason });
  };

  return (
    <form
      aria-label={t("Reject prescription")}
      aria-busy={isSaving || undefined}
      className="space-y-5"
      onSubmit={submit}
    >
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <FontAwesomeIcon icon={faExclamationTriangle} className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />
        <p>{t("The customer will see this reason. Please keep it clear and respectful.")}</p>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700" htmlFor="prescription-rejection-reason">
            {t("Rejection reason")} <span className="text-red-600">*</span>
          </label>
          <span className="text-xs tabular-nums text-slate-400">{rejectionReason.length}</span>
        </div>
        <textarea
          id="prescription-rejection-reason"
          value={rejectionReason}
          onChange={(event) => {
            setRejectionReason(event.target.value);
            setValidationError("");
          }}
          disabled={isSaving}
          rows={4}
          placeholder={t("Explain why this prescription is being rejected")}
          style={direction === "rtl" ? { direction: "rtl", textAlign: "right" } : undefined}
          aria-invalid={Boolean(validationError)}
          aria-describedby={validationError ? "prescription-rejection-error" : undefined}
          className={`w-full resize-y rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:bg-slate-50 disabled:text-slate-500 ${
            validationError
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
          }`}
        />
      </div>

      {(validationError || error) && (
        <div ref={feedbackRef} className="space-y-3">
          {validationError && (
            <p id="prescription-rejection-error" role="alert" className="text-sm text-red-600">
              {t(validationError)}
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error?.response?.data?.message || error?.response?.data?.errors
                ? getApiErrorMessage(error, { details: true, fallback: t("Failed to reject prescription.") })
                : t("Failed to reject prescription.")}
            </p>
          )}
        </div>
      )}
      <FormActions
        onCancel={onClose}
        showCancel={!isSaving}
        isSaving={isSaving}
        submitLabel={t("Reject prescription")}
        savingLabel={t("Rejecting...")}
        cancelLabel={t("Cancel")}
        submitClassName="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-200 disabled:opacity-60"
      />
    </form>
  );
}
