import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotate,
  faShieldHalved,
  faSpinner,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import ClientAvatar from "../../../shared/components/ClientAvatar";
import useEmployeeResetPasswordMutation from "../hooks/useEmployeeResetPasswordMutation"; // عدّل المسار

export default function ResetPasswordModal({ employee, onClose, onReset }) {
  const { t } = useTranslation("adminPages");
  const { resetMutation } = useEmployeeResetPasswordMutation({
    onSuccess: (response) => onReset?.(response),
  });
  const isResetting = resetMutation.isPending;

  const employeeId = employee?.employeeId ?? employee?.id;
  const employeeName =
    employee?.employeeName?.trim() ||
    [employee?.firstName, employee?.lastName].filter(Boolean).join(" ").trim() ||
    t("Employee");
  const groupName = employee?.groupName || employee?.employeeGroupName;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-password-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white shadow-sm">
              <FontAwesomeIcon icon={faShieldHalved} />
            </div>
            <div>
              <h2 id="reset-password-title" className="text-base font-semibold text-slate-900">
                {t("Reset Password")}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">{t("A new password will be generated.")}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isResetting}
            aria-label={t("Close")}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <ClientAvatar
              name={employeeName}
              colorSeed={employeeId}
              sizeClass="h-10 w-10"
              textClass="text-sm font-semibold"
            />
            <div className="min-w-0">
              <p dir="auto" className="truncate text-sm font-semibold text-slate-900">
                {employeeName}
              </p>
              <p className="text-xs text-slate-500">
                #{employeeId}
                {groupName && ` • ${groupName}`}
              </p>
            </div>
          </div>

          <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 text-amber-500" />
            <p>
              {t("The employee's current password will stop working immediately, and a new one will be shown to you once.")}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isResetting}
              className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("Cancel")}
            </button>
            <button
              type="button"
              onClick={() => resetMutation.mutate({ employeeId })}
              disabled={isResetting}
              className="flex min-w-[150px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isResetting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  {t("Resetting...")}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faRotate} />
                  {t("Reset Password")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
