import FormModalShell from "../../../shared/components/FormModalShell";
import StatusBadge from "../../../shared/components/StatusBadge";
import { formatDateTimeShort } from "../../../utils/formatDate";

const statusTone = {
  Pending: "warning",
  Processed: "success",
  Rejected: "danger",
};

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm text-slate-800">{children || "—"}</dd>
    </div>
  );
}

export default function PrescriptionDetailsModal({ prescription, onClose, onProcess, onReject }) {
  if (!prescription) return null;

  return (
    <FormModalShell
      native
      titleId="prescription-details-title"
      title={`Prescription #${prescription.id}`}
      description="Submitted prescription and review details"
      closeLabel="Close prescription details"
      className="max-w-2xl"
      onClose={onClose}
    >
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Detail label="Customer">{prescription.customerFullName}</Detail>
        <Detail label="Phone">{prescription.phoneNumber}</Detail>
        <Detail label="Status">
          <StatusBadge tone={statusTone[prescription.status] || "neutral"}>
            {prescription.status || "Unknown"}
          </StatusBadge>
        </Detail>
        <Detail label="Submitted">{formatDateTimeShort(prescription.createdAt)}</Detail>
        <Detail label="Reviewed by">{prescription.reviewedByEmployeeFullName}</Detail>
        <Detail label="Reviewed at">{formatDateTimeShort(prescription.reviewedAt)}</Detail>
      </dl>

      <dl className="space-y-4 border-t border-slate-100 pt-4">
        <Detail label="Prescription text">
          <span dir="auto" className="whitespace-pre-wrap">{prescription.text}</span>
        </Detail>
        {prescription.rejectionReason && (
          <Detail label="Rejection reason">{prescription.rejectionReason}</Detail>
        )}
      </dl>

      {prescription.imageUrl && (
        <div className="border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Prescription image
          </p>
          <a
            href={prescription.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-slate-200 bg-slate-50 p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            aria-label={`Open prescription #${prescription.id} image in a new tab`}
          >
            <img
              src={prescription.imageUrl}
              alt={`Prescription #${prescription.id}`}
              className="mx-auto max-h-[50vh] max-w-full object-contain"
            />
          </a>
        </div>
      )}
      {prescription.status === "Pending" && (onProcess || onReject) && (
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          {onReject && (
            <button
              type="button"
              onClick={onReject}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Reject prescription
            </button>
          )}
          {onProcess && (
            <button
              type="button"
              onClick={onProcess}
              className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Process prescription
            </button>
          )}
        </div>
      )}
    </FormModalShell>
  );
}
