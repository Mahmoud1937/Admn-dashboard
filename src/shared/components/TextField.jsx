import { forwardRef } from "react";
import { sanitizeNameInput } from "../utils/sanitizeInput";

const TextField = forwardRef(function TextField(
  { label, required, autoFocus, error, onChange, maxLength = 255, sanitize = true, dir = "ltr", readOnly, ...rest },
  ref
) {
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
        dir={dir}
        autoFocus={autoFocus}
        ref={ref}
        onChange={handleChange}
        maxLength={maxLength}
        readOnly={readOnly}
        {...rest}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-left outline-none focus:border-blue-400 ${
          error ? "border-red-400" : "border-slate-200"
        } ${readOnly ? "bg-slate-50 text-slate-500 cursor-not-allowed" : ""}`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default TextField;