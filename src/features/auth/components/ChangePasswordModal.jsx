import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleExclamation,
  faEye,
  faEyeSlash,
  faKey,
  faLock,
  faSpinner,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { changePasswordSchema } from "../schema/loginSchema";
import useAuthMutations from "../hooks/useAuthMutations";

const initialForm = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

const initialVisibility = {
  currentPassword: false,
  newPassword: false,
  confirmNewPassword: false,
};

const fields = [
  {
    name: "currentPassword",
    label: "Current Password",
    placeholder: "Enter your current password",
    autoComplete: "current-password",
  },
  {
    name: "newPassword",
    label: "New Password",
    placeholder: "Enter your new password",
    autoComplete: "new-password",
  },
  {
    name: "confirmNewPassword",
    label: "Confirm New Password",
    placeholder: "Re-enter your new password",
    autoComplete: "new-password",
  },
];

const strengthLevels = [
  { label: "Too short", text: "text-slate-400", bar: "bg-slate-200" },
  { label: "Weak", text: "text-red-600", bar: "bg-red-500" },
  { label: "Fair", text: "text-amber-600", bar: "bg-amber-500" },
  { label: "Good", text: "text-blue-600", bar: "bg-blue-500" },
  { label: "Strong", text: "text-green-600", bar: "bg-green-500" },
];

const getStrength = (password) => {
  if (!password) return 0;
  const score = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  return password.length < 6 ? 0 : Math.max(score, 1);
};

export default function ChangePasswordModal({ onClose, forced = false }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [visible, setVisible] = useState(initialVisibility);
  const firstInputRef = useRef(null);

  const {
    changePassword,
    isChangingPassword,
    logout,
    isLoggingOut,
    serverErrors,
    clearServerErrors,
  } = useAuthMutations();

  // منع scroll الصفحة اللي ورا المودال + focus على أول حقل
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstInputRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const strengthIndex = useMemo(() => getStrength(form.newPassword), [form.newPassword]);
  const strength = strengthLevels[strengthIndex];

  const passwordsMatch =
    form.confirmNewPassword.length > 0 && form.newPassword === form.confirmNewPassword;
  const passwordsMismatch =
    form.confirmNewPassword.length > 0 && form.newPassword !== form.confirmNewPassword;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
    clearServerErrors();
  };

  const toggleVisibility = (name) =>
    setVisible((previous) => ({ ...previous, [name]: !previous[name] }));

  const handleSubmit = (event) => {
    event.preventDefault();

    const result = changePasswordSchema.safeParse(form);
    if (!result.success) {
      const nextErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    changePassword(result.data);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white shadow-sm">
              <FontAwesomeIcon icon={faKey} />
            </div>
            <div>
              <h2
                id="change-password-title"
                className="text-base font-semibold text-slate-900"
              >
                Change Password
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                You will be signed out after changing your password.
              </p>
            </div>
          </div>

          {!forced && (
            <button
              type="button"
              onClick={onClose}
              disabled={isChangingPassword}
              aria-label="Close"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6" noValidate>
          {forced && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className="mt-0.5 shrink-0"
              />
              <p>
                You are using a temporary password. Please set a new password
                to continue.
              </p>
            </div>
          )}

          {fields.map(({ name, label, placeholder, autoComplete }, index) => {
            const error = errors[name] || serverErrors?.[name];
            const isVisible = visible[name];

            return (
              <div key={name}>
                <label
                  htmlFor={name}
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  {label}
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm text-slate-400">
                    <FontAwesomeIcon icon={faLock} />
                  </span>

                  <input
                    id={name}
                    ref={index === 0 ? firstInputRef : null}
                    type={isVisible ? "text" : "password"}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    disabled={isChangingPassword}
                    className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:bg-slate-50 ${
                      error
                        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-300 focus:border-blue-900 focus:ring-blue-900/10"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => toggleVisibility(name)}
                    tabIndex={-1}
                    aria-label={isVisible ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center text-slate-400 transition hover:text-slate-700"
                  >
                    <FontAwesomeIcon icon={isVisible ? faEyeSlash : faEye} />
                  </button>
                </div>

                {/* Strength meter */}
                {name === "newPassword" && form.newPassword && !error && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            strengthIndex >= level ? strength.bar : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`mt-1 text-xs font-medium ${strength.text}`}>
                      {strength.label}
                    </p>
                  </div>
                )}

                {/* Match indicator */}
                {name === "confirmNewPassword" && !error && (
                  <>
                    {passwordsMatch && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-green-600">
                        <FontAwesomeIcon icon={faCircleCheck} />
                        Passwords match
                      </p>
                    )}
                    {passwordsMismatch && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-600">
                        <FontAwesomeIcon icon={faCircleExclamation} />
                        Passwords do not match yet
                      </p>
                    )}
                  </>
                )}

                {error && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                    <FontAwesomeIcon icon={faCircleExclamation} />
                    {error}
                  </p>
                )}
              </div>
            );
          })}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={forced ? logout : onClose}
              disabled={isChangingPassword || isLoggingOut}
              className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {forced ? (isLoggingOut ? "Signing out..." : "Sign out") : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isChangingPassword || isLoggingOut}
              className="flex min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isChangingPassword ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Saving...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
