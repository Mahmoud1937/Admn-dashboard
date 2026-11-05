import { useState } from "react";
import FormActions from "../../../shared/components/FormActions";
import FormModalShell from "../../../shared/components/FormModalShell";
import { getApiErrorMessage } from "../../../shared/helpers/apiErrorHandler";

export default function RejectPrescriptionModal({ prescription, onClose, onReject, isSaving, error }) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [validationError, setValidationError] = useState("");

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
    <FormModalShell
      native
      titleId="reject-prescription-title"
      title={`Reject prescription #${prescription.id}`}
      description={prescription.customerFullName || `Customer #${prescription.customerId}`}
      closeLabel="Close reject prescription form"
      className="max-w-xl"
      isSaving={isSaving}
      onClose={onClose}
      onSubmit={submit}
    >
      {prescription.text && (
        <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Prescription text</p>
          <p className="whitespace-pre-wrap" dir="auto">{prescription.text}</p>
        </div>
      )}
      {prescription.imageUrl && (
        <a
          href={prescription.imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg border border-slate-200 bg-slate-50 p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          aria-label={`Open prescription #${prescription.id} image in a new tab`}
        >
          <img
            src={prescription.imageUrl}
            alt={`Prescription #${prescription.id}`}
            className="mx-auto max-h-48 max-w-full object-contain"
          />
        </a>
      )}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="prescription-rejection-reason">
          Rejection reason <span className="text-red-600">*</span>
        </label>
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
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 disabled:bg-slate-50"
        />
        {validationError && (
          <p id="prescription-rejection-error" role="alert" className="mt-1 text-sm text-red-600">
            {validationError}
          </p>
        )}
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {getApiErrorMessage(error, { details: true, fallback: "Failed to reject prescription." })}
        </p>
      )}
      <FormActions
        onCancel={onClose}
        showCancel={!isSaving}
        isSaving={isSaving}
        submitLabel="Reject prescription"
        savingLabel="Rejecting..."
        submitClassName="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
      />
    </FormModalShell>
  );
}
