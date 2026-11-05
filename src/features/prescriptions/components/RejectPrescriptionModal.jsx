import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import FormActions from "../../../shared/components/FormActions";
import PrescriptionSidebarShell from "./PrescriptionSidebarShell";
import { getApiErrorMessage } from "../../../shared/helpers/apiErrorHandler";

export default function RejectPrescriptionModal({ prescription, onClose, onReject, isSaving, error }) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [validationError, setValidationError] = useState("");
  const feedbackRef = useRef(null);

  useEffect(() => {
    if (error || validationError) feedbackRef.current?.scrollIntoView({ block: "end" });
  }, [error, validationError]);

  const submit = (event) => {
    event.preventDefault();
    const reason = rejectionReason.trim();
    if (!reason) {
      setValidationError("Enter a reason for rejecting this prescription.");
      return;
    }

    setValidationError("");
    onReject({ manualPrescriptionId: prescription.id, rejectionReason: reason });
  };

  return (
    <PrescriptionSidebarShell
      titleId="reject-prescription-title"
      title={`Reject prescription #${prescription.id}`}
      description={[prescription.customerFullName || `Customer #${prescription.customerId}`, prescription.phoneNumber].filter(Boolean).join(" · ")}
      closeLabel="Close reject prescription form"
      className="max-w-xl"
      isSaving={isSaving}
      onClose={onClose}
      onSubmit={submit}
      footer={(
        <FormActions
          className="flex items-center justify-end gap-3"
          onCancel={onClose}
          showCancel={!isSaving}
          isSaving={isSaving}
          submitLabel="Reject prescription"
          savingLabel="Rejecting..."
          submitClassName="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-200 disabled:opacity-60"
        />
      )}
    >
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <FontAwesomeIcon icon={faExclamationTriangle} className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />
        <p>The customer will see this reason. Please keep it clear and respectful.</p>
      </div>

      {(prescription.text || prescription.imageUrl) && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          {prescription.text && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Prescription text
              </p>
              <p className="whitespace-pre-wrap rounded-lg bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-700 ring-1 ring-slate-200" dir="auto">
                {prescription.text}
              </p>
            </div>
          )}
          {prescription.imageUrl && (
            <a
              href={prescription.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden rounded-lg bg-white p-2 ring-1 ring-slate-200 transition hover:ring-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label={`Open prescription #${prescription.id} image in a new tab`}
            >
              <img
                src={prescription.imageUrl}
                alt={`Prescription #${prescription.id}`}
                className="mx-auto max-h-48 max-w-full object-contain"
              />
              <span className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900/70 px-2.5 py-1 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                <FontAwesomeIcon icon={faExternalLinkAlt} aria-hidden="true" /> Open
              </span>
            </a>
          )}
        </section>
      )}

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700" htmlFor="prescription-rejection-reason">
            Rejection reason <span className="text-red-600">*</span>
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
          placeholder="Explain why this prescription is being rejected"
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
              {validationError}
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {getApiErrorMessage(error, { details: true, fallback: "Failed to reject prescription." })}
            </p>
          )}
        </div>
      )}
    </PrescriptionSidebarShell>
  );
}
