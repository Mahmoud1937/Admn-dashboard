import { useTranslation } from "react-i18next";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function EmployeePasswordModal({ password, onClose }) {
  const { t } = useTranslation("adminPages");
  const [copied, setCopied] = useState(false);

  if (!password) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {t("Employee registered successfully")}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {t("Copy this generated password and share it securely with the employee.")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label={t("Close password dialog")}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <code className="min-w-0 flex-1 break-all font-mono text-sm font-semibold text-slate-800">
            {password}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800"
          >
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
            {copied ? t("Copied") : t("Copy")}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          {t("Close")}
        </button>
      </div>
    </div>
  );
}
