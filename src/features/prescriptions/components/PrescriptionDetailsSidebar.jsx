import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare, faImage, faXmark } from "@fortawesome/free-solid-svg-icons";
import ClientAvatar from "../../../shared/components/ClientAvatar";
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
      <dd className="mt-1 break-words text-sm text-slate-800" dir="auto">{children ?? "—"}</dd>
    </div>
  );
}

function PrescriptionImage({ prescription }) {
  const [hasError, setHasError] = useState(false);

  if (!prescription.imageUrl || hasError) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-white p-5 text-sm text-slate-500">
        <FontAwesomeIcon icon={faImage} className="text-2xl text-slate-300" />
        <p>{hasError ? "Unable to load the prescription image." : "No prescription image attached."}</p>
      </div>
    );
  }

  return (
    <a
      href={prescription.imageUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-xl border border-slate-200 bg-white p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
      aria-label={`Open prescription #${prescription.id} image in a new tab`}
    >
      <img
        src={prescription.imageUrl}
        alt={`Prescription #${prescription.id}`}
        onError={() => setHasError(true)}
        className="mx-auto max-h-[50vh] w-full object-contain"
      />
      <span className="mt-2 flex items-center justify-center gap-1.5 pb-1 text-xs font-medium text-blue-800">
        <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
        Open full image
      </span>
    </a>
  );
}

export default function PrescriptionDetailsSidebar({ prescription, onClose, onProcess, onReject }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    const animation = !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? dialog.animate(
          [{ transform: "translateX(100%)" }, { transform: "translateX(0)" }],
          { duration: 220, easing: "ease-out" }
        )
      : null;

    return () => {
      animation?.cancel();
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby="prescription-details-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-y-0 left-auto right-0 m-0 ml-auto h-dvh max-h-none w-full max-w-xl overflow-hidden border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/50 sm:rounded-l-2xl"
    >
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 id="prescription-details-title" className="text-lg font-semibold">Prescription details</h2>
            <p className="mt-0.5 text-xs text-slate-500">Prescription #{prescription.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close prescription details"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-slate-50 p-5 sm:p-6">
          <section aria-label="Customer details" className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <ClientAvatar name={prescription.customerFullName} colorSeed={prescription.customerId} sizeClass="h-11 w-11" textClass="text-sm" />
              <div className="min-w-0">
                <h3 className="break-words font-semibold text-slate-900" dir="auto">{prescription.customerFullName || "Unknown customer"}</h3>
                {prescription.phoneNumber && (
                  <a href={`tel:${prescription.phoneNumber}`} className="mt-0.5 inline-block text-sm tabular-nums text-slate-500 hover:text-blue-800" dir="ltr">
                    {prescription.phoneNumber}
                  </a>
                )}
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <Detail label="Customer ID">{prescription.customerId}</Detail>
              <Detail label="Status">
                <StatusBadge tone={statusTone[prescription.status] || "neutral"}>{prescription.status || "Unknown"}</StatusBadge>
              </Detail>
              <Detail label="Submitted">{formatDateTimeShort(prescription.createdAt)}</Detail>
            </dl>
          </section>

          <section aria-label="Prescription image">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Prescription image</h3>
            <PrescriptionImage key={prescription.imageUrl || "no-image"} prescription={prescription} />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Prescription text</h3>
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700" dir="auto">{prescription.text || "No text provided."}</p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Review details</h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Detail label="Reviewed by">{prescription.reviewedByEmployeeFullName}</Detail>
              <Detail label="Reviewed at">{formatDateTimeShort(prescription.reviewedAt)}</Detail>
            </dl>
            {prescription.rejectionReason && (
              <div className="mt-4 rounded-lg bg-red-50 p-3">
                <p className="text-xs font-semibold text-red-700">Rejection reason</p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-red-700" dir="auto">{prescription.rejectionReason}</p>
              </div>
            )}
          </section>
        </div>

        {prescription.status === "Pending" && (onProcess || onReject) && (
          <footer className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
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
          </footer>
        )}
      </div>
    </dialog>
  );
}
