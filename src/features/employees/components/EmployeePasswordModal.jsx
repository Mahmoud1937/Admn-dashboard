import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function EmployeePasswordModal({ password, onClose, isOwnReset = false }) {
  const [copied, setCopied] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [copyError, setCopyError] = useState("");

  if (!password) return null;

  const handleCopy = async () => {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setHasSaved(true);
    } catch {
      setCopyError(isOwnReset
        ? "Automatic copying is unavailable. Select and copy the password above, then confirm you have saved it."
        : "Automatic copying is unavailable. Select and copy the password above.");
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="employee-password-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="employee-password-title" className="text-lg font-semibold text-slate-900">
              {isOwnReset ? "Password reset successfully" : "Employee registered successfully"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {isOwnReset ? "Save your new password before continuing to login. This password will not be shown again after you close this window." : "Copy this generated password and share it securely with the employee."}
            </p>
          </div>
          {!isOwnReset && <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close password dialog"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>}
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <code
            tabIndex={0}
            onCopy={() => { setHasSaved(true); setCopyError(""); }}
            className="min-w-0 flex-1 select-text break-all font-mono text-sm font-semibold text-slate-800"
          >
            {password}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            autoFocus={isOwnReset}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800"
          >
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {copyError && <p role="alert" className="mt-3 text-sm text-amber-700">{copyError}</p>}
        {isOwnReset && (
          <label className="mt-5 flex items-start gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={hasSaved} onChange={(event) => setHasSaved(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-blue-900" />
            I have saved my new password.
          </label>
        )}

        <button
          type="button"
          onClick={onClose}
          disabled={isOwnReset && !hasSaved}
          className="mt-5 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isOwnReset ? "Continue to login" : "Close"}
        </button>
      </div>
    </div>
  );
}
