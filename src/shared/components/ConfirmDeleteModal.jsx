import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faCircleCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

export default function ConfirmDeleteModal({
  isOpen,
  title,
  message,
  confirmLabel,
  variant = "danger", // "danger" | "success"
  isLoading,
  onConfirm,
  onCancel,
  inline = false,
  titleId,
  errorMessage,
  loadingLabel,
  cancelLabel,
  confirmIcon,
}) {
  const { t } = useTranslation("common");
  if (!isOpen) return null;

  const isSuccess = variant === "success";

  return (
    <div
      role={inline ? "group" : undefined}
      aria-labelledby={inline ? titleId : undefined}
      aria-busy={inline ? Boolean(isLoading) : undefined}
      className={inline ? "w-full space-y-3 rounded-xl border border-red-200 bg-red-50 p-4" : "fixed inset-0 z-50 flex items-center justify-center bg-black/40"}
    >
      <div className={inline ? "space-y-3" : "w-full max-w-md rounded-xl bg-white p-6 shadow-xl"}>
        <div className="flex items-start gap-4">
          {!inline && <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isSuccess
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            <FontAwesomeIcon icon={isSuccess ? faCircleCheck : faTriangleExclamation} />
          </div>}

          <div>
            <h3 id={titleId} className={`${inline ? "text-sm" : "text-base"} font-semibold text-slate-900`}>
              {title ?? t("Confirm Delete")}
            </h3>
            <p className={`mt-1 text-sm ${inline ? "text-slate-600" : "text-slate-500"}`}>{message}</p>
          </div>
        </div>

        <div className={inline ? "flex flex-wrap gap-2" : "mt-6 flex justify-end gap-3"}>
          <button
            type={inline ? "button" : undefined}
            onClick={onCancel}
            disabled={isLoading}
            className={inline
              ? "rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
              : "rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"}
          >
            {cancelLabel ?? t("Cancel")}
          </button>

          <button
            type={inline ? "button" : undefined}
            onClick={onConfirm}
            disabled={isLoading}
            className={inline
              ? "inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-50"
              : `rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60 ${
              isSuccess
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {confirmIcon && <FontAwesomeIcon icon={isLoading ? faSpinner : confirmIcon} spin={Boolean(isLoading)} />}
            {isLoading ? loadingLabel ?? t("Processing...") : confirmLabel ?? t("Delete")}
          </button>
        </div>
        {errorMessage && <p role="alert" className="text-sm text-red-600">{errorMessage}</p>}
      </div>
    </div>
  );
}
