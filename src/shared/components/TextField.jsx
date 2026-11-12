import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import localizeMessage from "../../localization/localizeMessage";
import { sanitizeNameInput } from "../utils/sanitizeInput";

const TextField = forwardRef(function TextField(
  {
    label,
    required,
    autoFocus,
    error,
    onChange,
    maxLength = 255,
    sanitize = true,
    dir,
    readOnly,
    disabled,
    ...rest
  },
  ref
) {
  const { i18n } = useTranslation("common");
  const direction = dir ?? i18n.dir();
  const handleChange = (e) => {
    if (sanitize) {
      e.target.value = sanitizeNameInput(e.target.value);
    }
    onChange?.(e);
  };

  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        dir={direction}
        style={{ textAlign: direction === "rtl" ? "right" : "left" }}
        autoFocus={autoFocus}
        ref={ref}
        onChange={handleChange}
        maxLength={maxLength}
        readOnly={readOnly}
        disabled={disabled}
        {...rest}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-left outline-none focus:border-blue-400 ${
          error ? "border-red-400" : "border-slate-200"
        } ${
          readOnly || disabled
            ? "cursor-not-allowed bg-slate-50 text-slate-500"
            : ""
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{localizeMessage(error)}</p>}
    </div>
  );
});

export default TextField;
